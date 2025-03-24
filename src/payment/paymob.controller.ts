import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PaymobService } from './paymob.service';
import { PaymentRequestDTO } from './dto/orderData';
import { JwtAuthGuard } from 'src/auth/guard';
import { CurUser } from 'src/users/decorators/get-user.decorator';
import { User } from '@prisma/client';

@Controller('payment')
export class PaymobController {
  private readonly logger = new Logger(PaymobController.name);

  constructor(private readonly paymobService: PaymobService) { }

  @UseGuards(JwtAuthGuard)
  @Post('/process-payment')
  async processPayment(
    @Body() paymentIntention: PaymentRequestDTO,
    @CurUser() user: User,
  ) {
    try {
      this.logger.log(`Processing payment for user ${user.id}, level: ${paymentIntention.level_name}`);
      const clientURL = await this.paymobService.processOrder(paymentIntention, user.id);
      return { success: true, clientURL };
    } catch (error) {
      this.logger.error(`Payment processing failed for user ${user.id}: ${error.message}`);
      throw new BadRequestException({ success: false, message: `Payment processing failed: ${error.message}` });
    }
  }

  @Post('/callback')
  async callbackPost(@Body() data: any) {
    try {
      const success = data.obj?.success;
      const orderId = data.obj?.id;
      const userEmail = data.obj?.order?.shipping_data.email;

      this.logger.log(`Callback received for order ${orderId}`);
      const result = await this.paymobService.handlePaymobCallback(orderId, success, data.obj.amount_cents, userEmail);
      return { success: result };
    } catch (error) {
      this.logger.error(`Callback handling failed for order ${data.obj?.id}: ${error.message}`);
      throw new InternalServerErrorException({ success: false, message: `Callback handling failed: ${error.message}` });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/refund')
  async refundOrder(@Body('levelName') levelName: string, @CurUser('id') userId: number) {
    try {
      this.logger.log(`Refund requested for user ${userId}, level: ${levelName}`);
      const result = await this.paymobService.refundOrder(levelName);
      return { success: true, result };
    } catch (error) {
      this.logger.error(`Refund failed for user ${userId}, level: ${levelName}: ${error.message}`);
      throw new BadRequestException({ success: false, message: `Refund failed: ${error.message}` });
    }
  }
}