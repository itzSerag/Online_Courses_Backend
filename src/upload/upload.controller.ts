import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AdminGuard, JwtAuthGuard } from 'src/auth/guard';
import { UploadFileDTO } from './dto';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  AllowedAudioMimeTypes,
  AllowedImageMimeTypes,
} from './enum/file-mime-types.enum';

@UseGuards(JwtAuthGuard)
@Controller('files')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('single-file')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDTO: UploadFileDTO,
  ) {
    // upload to AWS and return the link
    if (!file) {
      throw new BadRequestException('File not found in request');
    }

    const allowedMimeTypes = [
      ...Object.values(AllowedAudioMimeTypes),
      ...Object.values(AllowedImageMimeTypes),
    ];

    if (!allowedMimeTypes.includes(file.mimetype as AllowedAudioMimeTypes)) {
      throw new BadRequestException(
        'Only mp3 and images files are allowed to be uploaded.',
      );
    }

    console.log(uploadFileDTO);

    return await this.uploadService.uploadSingleFile(file, uploadFileDTO);
  }

  @UseGuards(AdminGuard)
  @Delete('')
  async deleteFile(
    @Body() content: UploadFileDTO,
    @Body('fileName') fileName: string,
  ) {
    return await this.uploadService.deleteFile(
      fileName,
      content.level_name, // Level
      content.day,
    );
  }

  @Get('')
  async getContentByName(
    @Body() content: UploadFileDTO,
    @Body('fileName') fileName: string,
  ) {
    const result = await this.uploadService.getContentByName(
      fileName,
      content.level_name, // Level
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
