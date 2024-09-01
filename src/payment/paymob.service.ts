import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { log } from 'console';

@Injectable()
export class PaymobService {
  public PAYMOB_SECRET_KEY: string;
  public integrationId: string;
  public hmacSecret: string;
  public PAYMOB_PUBLIC_KEY: string;

  constructor(private readonly configService: ConfigService) {
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
  async createIntention(paymentRequest: any) {
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

      log('data:', data);

      // MAKE A CHANGE IN DB

      return data;
    } catch (error) {
      throw new HttpException(
        'Failed to create payment intention',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Create Order
  async processOrder(paymentRequest: any): Promise<any> {
    try {
      const dataUserPaymentIntention =
        await this.createIntention(paymentRequest);

      const clientSecretToken = dataUserPaymentIntention.client_secret;
      const clientURL = `https://accept.paymob.com/unifiedcheckout/?publicKey=${this.PAYMOB_PUBLIC_KEY}&clientSecret=${clientSecretToken}`;
      return clientURL;
    } catch (error) {
      throw new HttpException(
        'Failed to process order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
