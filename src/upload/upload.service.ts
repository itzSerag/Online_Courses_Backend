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
    const key = `Levels/${uploadDataDTO.level_name}/${uploadDataDTO.day}/${uploadDataDTO.key}.json`;

    // Convert the data array to a JSON string
    const jsonData = JSON.stringify(uploadDataDTO.data);

    try {
      const command = new PutObjectCommand({
        Bucket: this.AWS_S3_BUCKET,
        Body: jsonData,
        Key: key,
        ContentType: 'application/json',
      });

      await this.S3Client.send(command).catch((error) => {
        throw new InternalServerErrorException(error);
      });

      return { message: 'File uploaded successfully to', key };
    } catch (err) {
      throw new InternalServerErrorException('Failed to upload file');
    }
  }


  async uploadSingleFile(
    file: Express.Multer.File,
    uploadFileDTO: UploadFileDTO,
  ) {
    if (!file) {
      throw new NotAcceptableException('File is required');
    }

    const fileTypePath = this.determineFileType(file.mimetype);
    if (!fileTypePath) {
      throw new NotAcceptableException(
        'Unsupported file type. Only images and audio files are allowed.',
      );
    }

    const key = this.generateFileKey(
      fileTypePath,
      uploadFileDTO,
      file.originalname,
    );

    try {
      await this.uploadToS3(file, key);
      return await this.__getFileUrl(key, this.AWS_S3_BUCKET_RES);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to upload file: ${error.message}`,
      );
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


