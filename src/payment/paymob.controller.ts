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
import * as fs from 'fs';
import * as path from 'path'; // Correct import for the path module
import { Level_Name } from './types';
import { PaymentPostBodyCallback } from './types/callback';
import { UsersService } from 'src/users/users.service';

@Controller('payment')
export class PaymobController {
  public filePath: string;

  constructor(
    private paymobService: PaymobService,
    private userService: UsersService,
  ) {
    // Correct file path usage
    this.filePath = path.join(__dirname, '../../src/courses-data.json');
  }
  @UseGuards(AuthGuard('jwt'))
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

    // read the json object and pass it to the service method
    const levelsData = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));

    // Find the level by its name
    const level = levelsData.Levels.find(
      (lvl) => lvl.name === paymentIntention.item_name,
    );

    if (!level) {
      throw new BadRequestException('Invalid item name');
    }

    const data = {
      amount: level.price,
      currency: 'EGP',
      payment_methods: [integration_id],

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

      return { clientURL };
    } catch (error) {
      throw new BadRequestException(
        `Payment processing failed: ${error.message}`,
      );
    }
  }

  @Post('callback')
  async callbackPost(@Body() data: PaymentPostBodyCallback) {
    log('WE ARE IN POST Post');

    const success = data.obj.success;
    const orderId = data.obj.id;
    const userEmail = data.obj.order.shipping_data.email;

    log(data.obj.order.shipping_data);


    const userData = await this.paymobService.handlePaymobCallback(
      orderId,
      success,
      data.obj.amount_cents,
      userEmail,
    );

    return { userData };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('refund')
  async refundOrder(@Req() req: any, @Body('item_name') itemName: Level_Name) {
    // an array of type orderewdq
    const userOrders = await this.userService.getUserCompletedOrders(
      req.user.id,
    );

    // see if the user orders got this item that he want to refund or not
    if (
      userOrders.length === 0 ||
      !userOrders.some((order) => order.itemName === itemName)
    ) {
      throw new BadRequestException('No order found for this item');
    }

    const { success } = await this.paymobService.refundOrder(
      userOrders[0].paymentId,
    );

    if (!success) {
      throw new BadRequestException('Failed to refund the order');
    }
    return { success };
  }
}
