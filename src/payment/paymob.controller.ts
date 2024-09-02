import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { PaymobService } from './paymob.service';
import { AuthGuard } from '@nestjs/passport';
import { PaymentRequestDTO } from './dto/orderData';
import { UserWithId } from 'src/users/types'; // Assuming you have a UserWithId type that includes user.id
import { log } from 'console';
import * as fs from 'fs';
import * as path from 'path'; // Correct import for the path module

@UseGuards(AuthGuard('jwt'))
@Controller('payment')
export class PaymobController {
  public filePath: string;

  constructor(private readonly paymobService: PaymobService) {
    // Correct file path usage
    this.filePath = path.join(__dirname, '../../src/courses-data.json');
  }

  @Post('process-payment')
  async processPayment(
    @Body() paymentIntention: PaymentRequestDTO,
    @Req() req: any,
  ) {
    const user: UserWithId = req.user; // Assuming the user object contains the id
    const integration_id = parseInt(process.env.PAYMOB_INTEGRATION_ID, 10);

    if (isNaN(integration_id)) {
      throw new BadRequestException('Invalid integration ID');
    }

    log(paymentIntention);

    // read the json object and pass it to the service method
    const levelsData = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));

    // Find the level by its name
    const level = levelsData.Levels.find(
      (lvl) => lvl.name === paymentIntention.item_name,
    );

    if (!level) {
      throw new BadRequestException('Invalid item name');
    }

    log(level);

    const data = {
      amount: level.price,
      currency: 'EGP',
      payment_methods: [integration_id], ////Enter your integration id

      items: [
        {
          name: paymentIntention.item_name,
          amount: level.price,
          description: level.description,
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

  @Get('callback')
  async callback(@Body() data: any) {
    try {
      // Implement callback logic here
      // const callbackResponse = await this.paymobService.callback(data);
      // return { success: true, callbackResponse };
    } catch (error) {
      throw new BadRequestException(`Callback failed: ${error.message}`);
    }
  }
}
