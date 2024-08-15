import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/guard/jwt.auth.guard';
import { AdminGuard } from '../auth/guard/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../upload/upload.service';
import { Express } from 'express';

@Controller('lessons')
export class LessonsController {
  constructor(
    private lessonsService: LessonsService,
    private uploadService: UploadService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('content'))
  async createLesson(
    @Body() lessonData: { title: string; order: number; courseId: number },
    @UploadedFile() file: Express.Multer.File,
  ) {
    let contentUrl;
    if (file) {
      contentUrl = await this.uploadService.uploadFile(
        file,
        `lessons/${file.originalname}`,
      );
    }
    return this.lessonsService.createLesson({
      ...lessonData,
      content: contentUrl,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getLessonById(@Param('id') id: string) {
    return this.lessonsService.getLessonById(parseInt(id));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('content'))
  async updateLesson(
    @Param('id') id: string,
    @Body() lessonData: { title?: string; order?: number },
    @UploadedFile() file: Express.Multer.File,
  ) {
    let contentUrl;
    if (file) {
      contentUrl = await this.uploadService.uploadFile(
        file,
        `lessons/${file.originalname}`,
      );
    }
    return this.lessonsService.updateLesson(parseInt(id), {
      ...lessonData,
      content: contentUrl,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  deleteLesson(@Param('id') id: string) {
    return this.lessonsService.deleteLesson(parseInt(id));
  }
}
