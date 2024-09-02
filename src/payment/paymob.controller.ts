import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { PaymobService } from './paymob.service';
import { AuthGuard } from '@nestjs/passport';
import { PaymentRequestDTO } from './dto/orderData';
import { UserWithId } from 'src/users/types'; // Assuming you have a UserWithId type that includes user.id
import { log } from 'console';

@UseGuards(AuthGuard('jwt'))
@Controller('payment')
export class PaymobController {
  constructor(private readonly paymobService: PaymobService) {}

  @Post('process-payment')
  async processPayment(
    @Body() paymentIntention: PaymentRequestDTO,
    @Req() req: any,
  ) {
    const user: UserWithId = req.user; // Assuming the user object contains the id

    // Parse the integration ID from string to number
    const integration_id = parseInt(process.env.PAYMOB_INTEGRATION_ID, 10);

    if (isNaN(integration_id)) {
      throw new BadRequestException('Invalid integration ID');
    }

    log(paymentIntention);
    const data = {
      amount: paymentIntention.amount,
      currency: 'EGP',
      payment_methods: [integration_id], ////Enter your integration id

      items: [
        {
          name: paymentIntention.item_name,
          amount: paymentIntention.amount,
          description: paymentIntention.item_description,
          quantity: 1,
        },
      ],
      billing_data: {
        apartment: 'dumy',
        first_name: user.firstName,
        last_name: user.lastName,
        street: 'dumy',
        building: 'dumy',
        phone_number: paymentIntention.phone_number,
        city: paymentIntention.city,
        country: paymentIntention.country,
        email: user.email,
        floor: 'dumy',
        state: 'dumy',
      },
    };

    try {
      // Process payment and pass userId to the service method
      const clientURL = await this.paymobService.processOrder(data, user.id);

      return { success: true, clientURL };
    } catch (error) {
      throw new BadRequestException(
        `Payment processing failed: ${error.message}`,
      );
    }
  }

  @Post('refund')
  async refundTransaction(
    @Body('transactionId') transactionId: string,
    @Body('amountCents') amountCents: number,
  ) {
    try {
      // Implement refund logic here
      // const refundResponse = await this.paymobService.refund(transactionId, amountCents);
      // return { success: true, refundResponse };
    } catch (error) {
      throw new BadRequestException(`Refund failed: ${error.message}`);
    }
  }
}