import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Express } from 'express';
import * as path from 'path';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class UploadController {
  constructor(private readonly fileUploadService: UploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const filePath = path.resolve('./uploads', file.filename);
    await this.fileUploadService.uploadToBunny(filePath);
    return { message: 'File uploaded successfully!' };
  }
}
