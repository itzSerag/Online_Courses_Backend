import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { log } from 'console';

@Injectable()
export class UploadService {
  public AWS_S3_BUCKET: string;
  private S3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.AWS_S3_BUCKET = 'online-courses-backend';
    this.S3Client = new S3Client({
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true,
    });
  }

  async uploadSingleFile(
    file: Express.Multer.File,
    item_name: string, // e.g., "Level_A1", "Level_A2", etc.
    stage: string, // e.g., "Stage_1", "Stage_2"
    day: string, // e.g., "Day_1", "Day_2", ..., "Day_25"
  ) {
    const key = `Levels/${item_name}/${stage}/${day}/${file.originalname}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.AWS_S3_BUCKET,
        Body: file.buffer,
        // file path
        Key: key,
        ACL: 'public-read',
        Metadata: {
          FileURL: `https://online-courses-backend.s3.amazonaws.com/${key}`,
        },
      });

      await this.S3Client.send(command).then((data) => {
        log(data);
      });

      return {
        url: (await this.getFileUrl(key)).url,
        key,
      };
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

      await this.S3Client.send(command);
      // notice 204 means there was a file and successfully deleted
      //    200 --> nothing to delete -- get the code from metadata

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
      const command = new GetObjectCommand({
        Bucket: this.AWS_S3_BUCKET,
        Key: key,
      });

      const data = await this.S3Client.send(command);

      const FileURL = data.Metadata.fileurl;

      if (!FileURL) {
        return null;
      }

      return FileURL;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /// UTILS ///
  async getFileUrl(key: string) {
    return { url: `https://${this.AWS_S3_BUCKET}.s3.amazonaws.com/${key}` };
  }
}
