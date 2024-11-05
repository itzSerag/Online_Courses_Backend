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
import { UploadDTO, UploadFileDTO, validateData } from './dto';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  AllowedAudioMimeTypes,
  AllowedImageMimeTypes,
} from './enum/file-mime-types.enum';
import { log } from 'console';

@UseGuards(JwtAuthGuard)
@Controller('files')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Get('')
  async getContentByName(@Body() content: UploadFileDTO) {
    const result = await this.uploadService.getContentByName(content);

    if (!result || result.length == 0) {
      throw new NotFoundException(
        `Can't find any file by this name or file is empty : ${content.lesson_name}`,
      );
    }

    return result;
  }

  @Post('')
  @UseGuards(AdminGuard)
  async upload(@Body() dataUploadDTO: UploadDTO) {
    await validateData(dataUploadDTO.key, dataUploadDTO.data);
    return await this.uploadService.upload(dataUploadDTO);
  }

  @Post('single-file')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingleFile(
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
  @Delete()
  async deleteFile(@Body() uploadFileDTO: UploadFileDTO) {
    const res = await this.uploadService.deleteFile(uploadFileDTO);
    if (!res) {
      throw new NotFoundException(
        `Can't find any file by this name : ${uploadFileDTO.lesson_name}`,
      );
    }
    log(res);
    return { message: 'File deleted successfully' };
  }
}
