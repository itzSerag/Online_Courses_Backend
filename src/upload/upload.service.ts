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
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { log } from 'console';

@Injectable()
export class UploadService {
  public AWS_S3_BUCKET: string;
  private S3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.AWS_S3_BUCKET = this.configService.getOrThrow('AWS_S3_BUCKET');
    this.S3Client = new S3Client({
      region: this.configService.getOrThrow('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadSingleFile(
    file: Express.Multer.File,
    item_name: string, // e.g., "Level_A1", "Level_A2", etc.
    stage: string, // e.g., "Stage_1", "Stage_2"
    day: string, // e.g., "Day_1", "Day_2", ..., "Day_25"
  ) {
    if (!file) {
      return new NotAcceptableException('file not found in request');
    }

    const key = `Levels/${item_name}/${stage}/${day}/${file.originalname}`;

    log(key);

    try {
      const command = new PutObjectCommand({
        Bucket: this.AWS_S3_BUCKET,
        Body: file.buffer,
        // file path
        Key: key,
      });

      await this.S3Client.send(command);

      return true;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async deleteFile(
    fileName: string,
    item_name: string,
    stage: string,
    day: string,
  ) {
    const key = `Levels/${item_name}/${stage}/${day}/${fileName}`;

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.AWS_S3_BUCKET,
        Key: key,
      });

      await this.S3Client.send(command).catch((err) => {
        log(err);
      });

      return { message: 'File deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(error + 'Cant Delete');
    }
  }

  async getContentByName(
    fileName: string,
    item_name: string,
    stage: string,
    day: string,
  ) {
    const key = `Levels/${item_name}/${stage}/${day}/${fileName}`;

    try {
      const URL = await this.getPresignedSignedUrl(key);

      if (!URL) {
        return null;
      }

      const data = await fetch(URL.url);
      return data.json();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getPresignedSignedUrl(key: string) {
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: this.AWS_S3_BUCKET,
        Key: key,
      });

      // will throw an erorr ifff the key does not exist
      await this.S3Client.send(headCommand);

      const command = new GetObjectCommand({
        Bucket: this.AWS_S3_BUCKET,
        Key: key,
      });

      const url = await getSignedUrl(this.S3Client, command, {
        expiresIn: 60 * 60 * 24, // 24 hours
      });

      return { url };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /// UTILS -- IFF its public///
  async getFileUrl(key: string) {
    return { url: `https://${this.AWS_S3_BUCKET}.s3.amazonaws.com/${key}` };
  }
}
