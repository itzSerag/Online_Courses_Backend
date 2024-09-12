import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service'; // assuming you have a PrismaService for database access
import { PaymentRequest, PaymentStatus } from './types';
import { log } from 'console';

@Injectable()
export class PaymobService {
  public PAYMOB_SECRET_KEY: string;
  public integrationId: string;
  public hmacSecret: string;
  public PAYMOB_PUBLIC_KEY: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService, // Injecting PrismaService
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

  // Get Auth Token
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

  // Create Order
  async processOrder(paymentRequest: PaymentRequest, userId: number) {
    try {
      const dataUserPaymentIntention =
        await this.createIntention(paymentRequest);
      const clientSecretToken = dataUserPaymentIntention.client_secret;
      const clientURL = `https://accept.paymob.com/unifiedcheckout/?publicKey=${this.PAYMOB_PUBLIC_KEY}&clientSecret=${clientSecretToken}`;

      log(clientURL);

      await this.prisma.order
        .create({
          data: {
            userId: userId,
            amountCents: paymentRequest.amount,
            paymentStatus: PaymentStatus.PENDING,
            itemName: paymentRequest.items[0].name,
            paymentId: null,
          },
        })
        .catch((error) => {
          throw new HttpException(
            'Failed to create order , or user already have the same level ' +
              error,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        });

      return clientURL;
    } catch (error) {
      throw new HttpException(
        'Failed to process order',
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

      // Get user id from email
      const user = await this.prisma.user.findUnique({
        where: {
          email: userEmail,
        },
      });

      log('User:', user);

      if (!user) {
        throw new HttpException(
          'User not found with the provided email',
          HttpStatus.NOT_FOUND,
        );
      }

      // Update the order in the database with payment status
      const updatedOrder = await this.prisma.order.update({
        where: {
          userId_amountCents: {
            userId: user.id,
            amountCents: amount,
          },
        },
        data: {
          paymentStatus: success
            ? PaymentStatus.COMPLETED
            : PaymentStatus.FAILED,
          paymentId: orderId.toString(),
        },
      });

      if (!updatedOrder) {
        throw new HttpException(
          'Order update failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
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
        where: {
          paymentId: orderId,
        },
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

      return data;
    } catch (error) {
      throw new HttpException(
        'Failed to refund order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
