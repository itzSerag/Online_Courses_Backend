import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadDTO, UploadFileDTO } from './dto';
import { log } from 'console';

@Injectable()
export class UploadService {
  private AWS_S3_BUCKET: string;
  private AWS_S3_BUCKET_RES: string;
  private S3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.AWS_S3_BUCKET = this.configService.getOrThrow('AWS_S3_BUCKET');
    this.AWS_S3_BUCKET_RES = this.configService.getOrThrow('AWS_S3_BUCKET_RES');
    this.S3Client = new S3Client({
      region: this.configService.getOrThrow('AWS_REGION'),

      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async upload(uploadDataDTO: UploadDTO) {
    try {
      // Handle file upload first if present
      let fileUrl: string | undefined;
      if (uploadDataDTO.file) {
        const fileTypePath = this.determineFileType(uploadDataDTO.file.mimetype);
        if (!fileTypePath) {
          throw new NotAcceptableException('Unsupported file type. Only images and audio files are allowed.');
        }

        const fileKey = this.generateFileKey(fileTypePath, {
          level_name: uploadDataDTO.level_name,
          day: uploadDataDTO.day,
          lesson_name: uploadDataDTO.key
        }, uploadDataDTO.file.originalname);

        await this.uploadToS3(uploadDataDTO.file, fileKey);
        const fileUrlResponse = await this.__getFileUrl(fileKey, this.AWS_S3_BUCKET_RES);
        fileUrl = fileUrlResponse.url;
      }

      // For PICTURES and LISTEN, we need a file
      if ((uploadDataDTO.key === 'PICTURES' || uploadDataDTO.key === 'LISTEN') && !fileUrl) {
        throw new BadRequestException(`File upload is required for ${uploadDataDTO.key} lessons`);
      }

      // Handle JSON data upload
      const dataKey = `Levels/${uploadDataDTO.level_name}/${uploadDataDTO.day}/${uploadDataDTO.key}.json`;
      
      // Add the file URL to the data based on the lesson type
      let processedData = [...uploadDataDTO.data];
      if (fileUrl) {
        switch (uploadDataDTO.key) {
          case 'PICTURES':
            processedData = [{ pictureSrc: fileUrl }];
            break;
          case 'LISTEN':
            processedData = [{ soundSrc: fileUrl }];
            break;
          case 'READ':
            processedData = processedData.map(item => ({
              ...item,
              soundSrc: fileUrl
            }));
            break;
          case 'SPEAK':
            processedData = processedData.map(item => ({
              ...item,
              soundSrc: fileUrl
            }));
            break;
          default:
            // For other types, we don't modify the data
            break;
        }
      }

      const jsonData = JSON.stringify(processedData);

      const command = new PutObjectCommand({
        Bucket: this.AWS_S3_BUCKET,
        Body: jsonData,
        Key: dataKey,
        ContentType: 'application/json',
      });

      await this.S3Client.send(command);

      return {
        message: 'Upload completed successfully',
        dataKey,
        fileUrl
      };
    } catch (error) {
      if (error instanceof NotAcceptableException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to upload: ${error.message}`);
    }
  }

  private determineFileType(mimetype: string): string | null {
    if (mimetype.includes('image')) {
      return 'Images';
    }
    if (mimetype.includes('audio')) {
      return 'Audio';
    }
    return null;
  }

  private generateFileKey(
    fileTypePath: string,
    uploadFileDTO: UploadFileDTO,
    originalName: string,
  ): string {
    return `${fileTypePath}/${uploadFileDTO.level_name}/${uploadFileDTO.day}/${originalName}`;
  }

  private async uploadToS3(
    file: Express.Multer.File,
    key: string,
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.AWS_S3_BUCKET_RES,
      Body: file.buffer,
      Key: key,
      ACL: 'public-read',
    });

    try {
      await this.S3Client.send(command);
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  async deleteFile(uploadFileDTO: UploadFileDTO) {
    const key = `Levels/${uploadFileDTO.level_name}/${uploadFileDTO.day}/${uploadFileDTO.lesson_name}.json`;

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.AWS_S3_BUCKET,
        Key: key,
      });

      const res = await this.S3Client.send(command).catch((err) => {
        log(err);
        throw new InternalServerErrorException(
          'can not delete the file now please try again later',
        );
      });

      return res;
    } catch (error) {
      throw new InternalServerErrorException(error + 'Cant Delete');
    }
  }

  async getContentByName(uploadFileDTO: UploadFileDTO) {
    const key = `Levels/${uploadFileDTO.level_name}/${uploadFileDTO.day}/${uploadFileDTO.lesson_name}.json`;
    const URL = await this.__getPresignedSignedUrl(key, this.AWS_S3_BUCKET);
    if (!URL) {
      return null;
    }
    const data = await fetch(URL.url);
    if (!data) {
      return null;
    }
    const jsonData = await data.json();
    return jsonData;
  }

  async __getPresignedSignedUrl(key: string, bucket: string) {
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      // will throw an error ifff the key does not exist
      await this.S3Client.send(headCommand).catch((err) => {
        throw new NotFoundException(`File Not Exist !! ${err.message}`);
      });

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.S3Client, command, {
        expiresIn: 60 * 60 * 24, // 24 hours
      });

      return { url: url };
    } catch (err) {
      throw new InternalServerErrorException(
        'Something wrong happened please try again',
      );
    }
  }

  /// UTILS -- IFF its public///
  async __getFileUrl(key: string, bucket: string) {
    return { url: `https://${bucket}.s3.amazonaws.com/${key}` };
  }
}
