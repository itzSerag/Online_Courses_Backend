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
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guard/jwt.auth.guard';
import { AdminGuard } from '../auth/guard/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../upload/upload.service';

@Controller('courses')
export class CoursesController {
  constructor(
    private coursesService: CoursesService,
    private uploadService: UploadService,
  ) {}

  @Get()
  getAllCourses() {
    return this.coursesService.getAllCourses();
  }

  @Get(':id')
  getCourseById(@Param('id') id: string) {
    return this.coursesService.getCourseById(parseInt(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('coverImage'))
  async createCourse(
    @Body()
    courseData: {
      title: string;
      description: string;
      price: number;
      categoryId: number;
    },
    @UploadedFile() file: Express.Multer.File,
  ) {
    let coverImageUrl;
    if (file) {
      // coverImageUrl = await this.uploadService.uploadFile(
      //   file,
      //   `courses/${file.originalname}`,
      // );
    }
    return this.coursesService.createCourse({
      ...courseData,
      coverImage: coverImageUrl,
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('coverImage'))
  async updateCourse(
    @Param('id') id: string,
    @Body()
    courseData: {
      title?: string;
      description?: string;
      price?: number;
      categoryId?: number;
    },
    @UploadedFile() file: Express.Multer.File,
  ) {
    let coverImageUrl;
    if (file) {
      // coverImageUrl = await this.uploadService.uploadFile(
      //   file,
      //   `courses/${file.originalname}`,
      // );
    }
    return this.coursesService.updateCourse(parseInt(id), {
      ...courseData,
      coverImage: coverImageUrl,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  deleteCourse(@Param('id') id: string) {
    return this.coursesService.deleteCourse(parseInt(id));
  }
}
