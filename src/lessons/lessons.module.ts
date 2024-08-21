import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from 'src/upload/upload.module';
@Module({
  imports: [PrismaModule, UploadModule],
})
export class LessonsModule {}
