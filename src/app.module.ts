import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';
import { PaymentModule } from './payment/paymob.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UploadModule,
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PaymentModule,
  ],
  controllers: [AppController, AuthController, UsersController],

  providers: [AppService],
})
export class AppModule {}
