import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from 'src/upload/upload.module';
@Module({
  providers: [CoursesService],
  imports: [PrismaModule, UploadModule],
  controllers: [CoursesController],
})
export class CoursesModule {}
