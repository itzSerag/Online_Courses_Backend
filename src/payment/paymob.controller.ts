import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PaymobService } from './paymob.service';
import { AuthGuard } from '@nestjs/passport';
import { PaymentRequestDTO } from './dto/orderData';
import { UserWithId } from 'src/users/types'; // Assuming you have a UserWithId type that includes user.id
import { log } from 'console';
import { PaymentPostBodyCallback } from './types/callback';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from 'src/auth/guard';
import { Level_Name } from '../shared/enums';
import { readCoursesData } from 'src/util/file-data-courses';

@Controller('payment')
export class PaymobController {
  constructor(
    private paymobService: PaymobService,
    private userService: UsersService,
  ) {}

  @Post('/callback')
  async callbackPost(@Body() data: PaymentPostBodyCallback) {
    log('WE ARE IN POST Post');

    const success = data.obj.success;
    const orderId = data.obj.id;
    const userEmail = data.obj.order.shipping_data.email;

    log(data.obj.order.shipping_data);

    try {
      const userData = await this.paymobService.handlePaymobCallback(
        orderId,
        success,
        data.obj.amount_cents,
        userEmail,
      );

      return { userData };
    } catch (e) {
      throw new InternalServerErrorException(
        `Failed to handle callback : ${e.message}`,
      );
    }
  }
  @UseGuards(JwtAuthGuard)
  @Post('/process-payment')
  async processPayment(
    @Body() paymentIntention: PaymentRequestDTO,
    @Req() req,
  ) {
    const user: UserWithId = req.user;
    const integration_id = parseInt(process.env.PAYMOB_INTEGRATION_ID, 10);
    console.log('integration_id', integration_id);

    if (isNaN(integration_id)) {
      throw new BadRequestException('Invalid integration ID');
    }

    try {
      // Read the JSON object and pass it to the service method
      const levelsData = readCoursesData();

      // Find the level by its name
      const level = levelsData.Levels.find(
        (lvl) => lvl.name === paymentIntention.item_name,
      );

      if (!level) {
        throw new BadRequestException('Level not found');
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
          apartment: 'dummy',
          first_name: user.firstName,
          last_name: user.lastName,
          street: 'dummy',
          building: 'dummy',
          phone_number: paymentIntention.phone_number,
          city: paymentIntention.city,
          country: paymentIntention.country,
          email: user.email,
          floor: 'dummy',
          state: 'dummy',
        },
      };

      // Process payment and pass userId to the service method
      const clientURL = await this.paymobService.processOrder(data, user.id);

      return { clientURL };
    } catch (error) {
      throw new BadRequestException(
        `Payment processing failed: ${error.message}`,
      );
    }
  }
  @UseGuards(JwtAuthGuard)
  @UseGuards(AuthGuard('jwt'))
  @Post('/refund')
  async refundOrder(@Req() req: any, @Body('levelName') levelName: Level_Name) {
    // an array of type Order
    const userOrders = await this.userService.getUserCompletedOrders(
      req.user.id,
    );

    // see if the user orders got this item that he want to refund or not
    if (
      userOrders.length === 0 ||
      !userOrders.some((order) => order.levelName === levelName)
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
