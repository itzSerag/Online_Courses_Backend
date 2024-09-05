import { Module } from '@nestjs/common';
import { PaymobService } from './paymob.service';
import { PaymobController } from './paymob.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [PaymobService],
  controllers: [PaymobController],
  imports: [UsersModule],
})
export class PaymentModule {}
