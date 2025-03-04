import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ParseFilePipe,
} from '@nestjs/common';
import { AdminGuard, JwtAuthGuard } from 'src/auth/guard';
import { UploadDTO, UploadFileDTO, validateData } from './dto';
import { UploadService } from './upload.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { log } from 'console';

@UseGuards(JwtAuthGuard)
@Controller('files')
export class UploadController {
  constructor(private uploadService: UploadService) {}


  
  @Get('')
  async getContentByName(@Query() content: UploadFileDTO) {
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
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'pictureSrc', maxCount: 1 },
      { name: 'soundSrc', maxCount: 1 },
    ])
  )
  async upload(
    @Body() dataUploadDTO: UploadDTO,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
      }),
    )
    files: {
      picture?: Express.Multer.File[];
      audio?: Express.Multer.File[];
    },
  ) {
    try {
      // Ensure data is parsed as an array
      if (typeof dataUploadDTO.data === 'string') {
        try {
          dataUploadDTO.data = JSON.parse(dataUploadDTO.data);
        } catch (error) {
          throw new BadRequestException('Invalid JSON data format');
        }
      }

      // Additional check to ensure data is an array
      if (!Array.isArray(dataUploadDTO.data)) {
        dataUploadDTO.data = [dataUploadDTO.data];
      }

      // Validate the data structure
      await validateData(dataUploadDTO.key, dataUploadDTO.data);

      return await this.uploadService.upload(dataUploadDTO, files);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
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
