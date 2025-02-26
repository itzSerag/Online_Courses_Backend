import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentRequest, PaymentStatus } from './types';
import { log } from 'console';
import { Level_Name } from '../common/enums';

@Injectable()
export class PaymobService {
  private PAYMOB_SECRET_KEY: string;
  private integrationId: string;
  private hmacSecret: string;
  private PAYMOB_PUBLIC_KEY: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.integrationId = this.configService.getOrThrow<string>(
      'PAYMOB_INTEGRATION_ID',
    );
    this.hmacSecret =
      this.configService.getOrThrow<string>('PAYMOB_HMAC_SECRET');
    this.PAYMOB_PUBLIC_KEY =
      this.configService.getOrThrow<string>('PAYMOB_PUBLIC_KEY');
    this.PAYMOB_SECRET_KEY =
      this.configService.getOrThrow<string>('PAYMOB_SECRET_KEY');
  }

  async createIntention(paymentRequest: PaymentRequest) {
    try {
      const res = await fetch('https://accept.paymob.com/v1/intention/', {
        method: 'POST',
        headers: {
          Authorization: `Token ${this.PAYMOB_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequest),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new HttpException(
          'Failed to create payment intention ' + error,
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await res.json();
      log(data);
      return data;
    } catch (error) {
      throw new HttpException(
        'Failed to create payment intention',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async processOrder(paymentRequest: PaymentRequest, userId: number) {
    try {
      // Validate input
      if (!paymentRequest?.items?.length || !paymentRequest.items[0].name) {
        throw new BadRequestException(
          'Invalid payment request: missing items or item name',
        );
      }

      const levelName = paymentRequest.items[0].name as Level_Name;

      // Check for existing completed order
      const existingCompletedOrder = await this.prisma.order.findFirst({
        where: {
          userId,
          levelName,
          paymentStatus: PaymentStatus.COMPLETED,
        },
      });

      if (existingCompletedOrder) {
        throw new BadRequestException(
          'Payment already completed for this level',
        );
      }

      // Create payment intention
      const dataUserPaymentIntention =
        await this.createIntention(paymentRequest);
      if (!dataUserPaymentIntention?.client_secret) {
        throw new InternalServerErrorException(
          'Failed to create payment intention',
        );
      }

      const clientURL = `https://accept.paymob.com/unifiedcheckout/?publicKey=${this.PAYMOB_PUBLIC_KEY}&clientSecret=${dataUserPaymentIntention.client_secret}`;

      // Create or update order record
      await this.prisma.order.upsert({
        where: {
          userId_levelName: {
            userId,
            levelName,
          },
        },
        create: {
          userId,
          levelName,
          amountCents: paymentRequest.amount,
          paymentStatus: PaymentStatus.PENDING,
          createdAt: new Date(),
        },
        update: {
          amountCents: paymentRequest.amount,
          paymentStatus: PaymentStatus.PENDING,
          createdAt: new Date(),
        },
      });

      return clientURL;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Payment processing failed: ${error.message}`,
      );
    }
  }

  async handlePaymobCallback(
    orderId: number,
    success: boolean,
    amount: number,
    userEmail: string,
  ) {
    try {
      if (!userEmail) {
        throw new BadRequestException('User email is required');
      }

      const user = await this.prisma.user.findUnique({
        where: { email: userEmail },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const pendingOrder = await this.prisma.order.findFirst({
        where: {
          userId: user.id,
          amountCents: amount,
          paymentStatus: PaymentStatus.PENDING,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!pendingOrder) {
        throw new NotFoundException('No matching pending order found');
      }

      const updatedOrder = await this.prisma.order.update({
        where: { id: pendingOrder.id },
        data: {
          paymentStatus: success
            ? PaymentStatus.COMPLETED
            : PaymentStatus.FAILED,
          paymentId: orderId.toString(),
        },
        include: { user: true },
      });

      if (success) {
        await this.prisma.userLevel.create({
          data: {
            userId: user.id,
            levelName: Level_Name[updatedOrder.levelName],
          },
        });
      }

      return success;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to process payment callback: ${error.message}`,
      );
    }
  }

  async refundOrder(orderId: string) {
    // first must check if the order exists and not refunded and the created at is less than 14 days
    try {
      const order = await this.prisma.order.findUnique({
        where: { paymentId: orderId, paymentStatus: PaymentStatus.COMPLETED },
      });

      if (!order) {
        throw new HttpException(
          'Order not found with the provided order id',
          HttpStatus.NOT_FOUND,
        );
      }

      if (order.createdAt < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)) {
        throw new HttpException(
          'Order is older than 14 days and cannot be refunded',
          HttpStatus.BAD_REQUEST,
        );
      }

      const refundRequest = {
        amount_cents: order.amountCents,
        transaction_id: orderId,
      };

      const res = await fetch(
        'https://accept.paymob.com/api/acceptance/void_refund/refund',
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${this.PAYMOB_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(refundRequest),
        },
      );

      if (!res.ok) {
        const error = await res.text();
        throw new HttpException(
          'Failed to refund order ' + error,
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await res.json();

      // If refund is successful, update the order and UserLevel
      if (data.success) {
        await this.prisma.order.update({
          where: { paymentId: orderId },
          data: { paymentStatus: PaymentStatus.REFUNDED },
        });

        await this.prisma.userLevel.delete({
          where: {
            userId_levelName: {
              userId: order.userId,
              levelName: order.levelName,
            },
          },
        });
      }
      return data;
    } catch (error) {
      throw new HttpException(
        'Failed to refund order: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
