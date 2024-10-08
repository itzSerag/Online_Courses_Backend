import { Global, Module } from '@nestjs/common';
import { PrismaController } from './prisma.controller';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  controllers: [PrismaController],

  exports: [PrismaService],
  providers: [PrismaService],
})
export class PrismaModule {}
