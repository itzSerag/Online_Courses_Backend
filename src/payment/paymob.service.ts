import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentRequest, PaymentStatus } from './types';
import { Level_Name } from '../common/enums';

@Injectable()
export class PaymobService {
  private readonly logger = new Logger(PaymobService.name);
  private readonly PAYMOB_SECRET_KEY: string;
  private readonly integrationId: string;
  private readonly hmacSecret: string;
  private readonly PAYMOB_PUBLIC_KEY: string;
  private readonly REQUEST_TIMEOUT = 20000; // 20 seconds timeout

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.integrationId = this.configService.getOrThrow<string>('PAYMOB_INTEGRATION_ID');
    this.hmacSecret = this.configService.getOrThrow<string>('PAYMOB_HMAC_SECRET');
    this.PAYMOB_PUBLIC_KEY = this.configService.getOrThrow<string>('PAYMOB_PUBLIC_KEY');
    this.PAYMOB_SECRET_KEY = this.configService.getOrThrow<string>('PAYMOB_SECRET_KEY');
  }

  private async fetchWithTimeout(url: string, options: any): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Paymob API error: ${error}`);
        throw new HttpException(`Paymob API error: ${error}`, HttpStatus.BAD_REQUEST);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new HttpException('Payment gateway request timed out', HttpStatus.GATEWAY_TIMEOUT);
      }
      throw new InternalServerErrorException(`Failed to fetch from Paymob: ${error.message}`);
    }
  }

  async processOrder(paymentRequest: any, userId: number): Promise<string> {
    try {
      const levelName = paymentRequest.items[0].name as Level_Name;

      if (!Object.values(Level_Name).includes(levelName)) {
        throw new BadRequestException(`Invalid level name: ${levelName}`);
      }

      return await this.prisma.$transaction(async (tx) => {
        const existingOrder = await tx.order.findFirst({
          where: { userId, levelName, paymentStatus: PaymentStatus.COMPLETED },
        });

        if (existingOrder) {
          throw new BadRequestException('User already owns this level');
        }

        const paymentIntention = await this.createPaymentIntention(paymentRequest);

        await tx.order.upsert({
          where: { userId_levelName: { userId, levelName } },
          create: {
            userId,
            levelName,
            amountCents: paymentRequest.amount,
            paymentStatus: PaymentStatus.PENDING,
          },
          update: {
            amountCents: paymentRequest.amount,
            paymentStatus: PaymentStatus.PENDING,
          },
        });

        return `https://accept.paymob.com/unifiedcheckout/?publicKey=${this.PAYMOB_PUBLIC_KEY}&clientSecret=${paymentIntention.client_secret}`;
      });
    } catch (error) {
      this.logger.error(`Order processing failed for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  private async createPaymentIntention(paymentRequest: PaymentRequest): Promise<any> {
    const url = 'https://accept.paymob.com/v1/intention/';
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Token ${this.PAYMOB_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentRequest),
    };

    return await this.fetchWithTimeout(url, options);
  }

  async handlePaymobCallback(orderId: number, success: boolean, amount: number, userEmail: string): Promise<boolean> {
    try {
      if (!userEmail) {
        throw new BadRequestException('User email is required');
      }

      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { email: userEmail } });
        if (!user) {
          throw new NotFoundException('User not found');
        }

        const pendingOrder = await tx.order.findFirst({
          where: { userId: user.id, amountCents: amount, paymentStatus: PaymentStatus.PENDING },
        });

        if (!pendingOrder) {
          throw new NotFoundException('No matching pending order found');
        }

        await tx.order.update({
          where: { id: pendingOrder.id },
          data: {
            paymentStatus: success ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
            paymentId: orderId.toString(),
          },
        });

        if (success) {
          await tx.userLevel.create({
            data: { userId: user.id, levelName: Level_Name[pendingOrder.levelName] },
          });
          this.logger.log(`Payment successful for user ${user.id}, level ${pendingOrder.levelName}`);
        } else {
          this.logger.warn(`Payment failed for user ${user.id}, level ${pendingOrder.levelName}`);
        }

        return success;
      });
    } catch (error) {
      this.logger.error(`Callback handling failed for order ${orderId}: ${error.message}`);
      throw error;
    }
  }

  async refundOrder(orderId: string): Promise<any> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { paymentId: orderId, paymentStatus: PaymentStatus.COMPLETED },
        });

        if (!order) {
          throw new NotFoundException('Order not found');
        }

        const refundCutoffDate = new Date();
        refundCutoffDate.setDate(refundCutoffDate.getDate() - 14);

        if (order.createdAt < refundCutoffDate) {
          throw new BadRequestException('Refund period has expired');
        }

        const refundResponse = await this.processRefund(order.amountCents, orderId);

        if (refundResponse.success) {
          await tx.order.update({
            where: { paymentId: orderId },
            data: { paymentStatus: PaymentStatus.REFUNDED },
          });

          await tx.userLevel.delete({
            where: { userId_levelName: { userId: order.userId, levelName: order.levelName } },
          });

          this.logger.log(`Refund successful for order ${orderId}`);
        } else {
          this.logger.warn(`Refund failed for order ${orderId}`);
        }

        return refundResponse;
      });
    } catch (error) {
      this.logger.error(`Refund failed for order ${orderId}: ${error.message}`);
      throw error;
    }
  }

  private async processRefund(amountCents: number, orderId: string): Promise<any> {
    const url = 'https://accept.paymob.com/api/acceptance/void_refund/refund';
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Token ${this.PAYMOB_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount_cents: amountCents, transaction_id: orderId }),
    };

    return this.fetchWithTimeout(url, options);
  }
}