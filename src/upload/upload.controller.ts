import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { log } from 'console';
import { AdminGuard } from 'src/auth/guard';
import { UploadDayContentDTO } from './dto';
import { UploadService } from './upload.service';

@Controller('files')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @UseGuards(AdminGuard)
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() content: UploadDayContentDTO,
  ) {
    if (file.mimetype !== 'application/json') {
      return new InternalServerErrorException('Invalid file type');
    }

    const result = await this.uploadService.uploadSingleFile(
      file,
      content.item_name, // Level_A1
      content.stage, // Stage_2
      content.day, // Day_22
    );

    if (!result) {
      return new InternalServerErrorException();
    }
    return {
      message: 'File uploaded successfully',
    };
  }

  @UseGuards(AdminGuard)
  @Delete('')
  async deleteFile(
    @Body() content: UploadDayContentDTO,
    @Body('fileName') fileName: string,
  ) {
    return await this.uploadService.deleteFile(
      fileName,
      content.item_name, // Level
      content.stage,
      content.day,
    );
  }

  @Get('')
  async getContentByName(
    @Body() content: UploadDayContentDTO,
    @Body('fileName') fileName: string,
  ) {
    const result = await this.uploadService.getContentByName(
      fileName,
      content.item_name, // Level
      content.stage, // stage_2
      content.day, // day_22
    );

    if (!result) {
      throw new NotFoundException(
        `Can't find any file by this name : ${fileName}`,
      );
    }
    return result;
  }
}
