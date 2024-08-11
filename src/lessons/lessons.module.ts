import { Module } from '@nestjs/common';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from 'src/upload/upload.module';
@Module({
  controllers: [LessonsController],
  providers: [LessonsService],
  imports: [PrismaModule, UploadModule],
})
export class LessonsModule {}
