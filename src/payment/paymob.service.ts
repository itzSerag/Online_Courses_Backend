import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Level_Name, PaymentRequest, PaymentStatus } from './types';
import { log } from 'console';

@Injectable()
export class PaymobService {
  public PAYMOB_SECRET_KEY: string;
  public integrationId: string;
  public hmacSecret: string;
  public PAYMOB_PUBLIC_KEY: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.integrationId = this.configService.get<string>(
      'PAYMOB_INTEGRATION_ID',
    );
    this.hmacSecret = this.configService.get<string>('PAYMOB_HMAC_SECRET');
    this.PAYMOB_PUBLIC_KEY =
      this.configService.get<string>('PAYMOB_PUBLIC_KEY');
    this.PAYMOB_SECRET_KEY =
      this.configService.get<string>('PAYMOB_SECRET_KEY');
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
      const dataUserPaymentIntention =
        await this.createIntention(paymentRequest);
      const clientSecretToken = dataUserPaymentIntention.client_secret;
      const clientURL = `https://accept.paymob.com/unifiedcheckout/?publicKey=${this.PAYMOB_PUBLIC_KEY}&clientSecret=${clientSecretToken}`;

      log(clientURL);

      // Create the order
      await this.prisma.order.create({
        data: {
          userId,
          levelName: paymentRequest.items[0].name as Level_Name,
          amountCents: paymentRequest.amount,
          paymentStatus: PaymentStatus.PENDING,
          createdAt: new Date(),
        },
      });

      // // Create or update UserLevel
      // await this.prisma.userLevel.upsert({
      //   where: {
      //     userId_levelName: {
      //       userId: userId,
      //       levelName: level.id_name,
      //     },
      //   },
      //   update: {
      //     purchased: false, // Will be set to true when payment is confirmed
      //   },
      //   create: {
      //     userId: userId,
      //     levelId: level.id,
      //     purchased: false,
      //   },
      // });

      return clientURL;
    } catch (error) {
      throw new HttpException(
        'Failed to process order: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
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
      log('INSIDE CALLBACK HANDLER');

      const user = await this.prisma.user.findUnique({
        where: { email: userEmail },
      });

      // Find the most recent pending order for this user
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
        throw new HttpException(
          'No matching pending order found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Update the order
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

      // If payment was successful, update UserLevel
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
      console.error('Error processing Paymob callback:', error.message);
      throw new HttpException(
        `Failed to process callback: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async refundOrder(orderId: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { paymentId: orderId },
      });

      if (!order) {
        throw new HttpException(
          'Order not found with the provided order id',
          HttpStatus.NOT_FOUND,
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
