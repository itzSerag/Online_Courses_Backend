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
import { log } from 'console';
import { UploadDTO, UploadFileDTO } from './dto';

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
    log(JSON.stringify(uploadDataDTO.data));
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
      throw new NotAcceptableException(
        'file not found in request or something wrong happened',
      );
    }

    let fileTypePath = '';
    if (file.mimetype.includes('image')) {
      fileTypePath = 'Images';
    }

    if (!fileTypePath) {
      if (file.mimetype.includes('audio')) {
        fileTypePath = 'Audio';
      }
    }

    const levelName = uploadFileDTO.level_name;
    const key = `${fileTypePath}/${levelName}/${uploadFileDTO.day}/${file.originalname}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.AWS_S3_BUCKET_RES,
        Body: file.buffer,
        // file path
        Key: key,
        ACL: 'public-read',
      });

      await this.S3Client.send(command).catch((error) => {
        log('something went wrong while uploading the file');
        throw new InternalServerErrorException(error);
      });

      return await this.__getFileUrl(key, this.AWS_S3_BUCKET_RES);
    } catch (err) {
      throw new InternalServerErrorException(err);
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
        throw new InternalServerErrorException(
          'cant delete the file now please try again later',
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

      // will throw an erorr ifff the key does not exist
      await this.S3Client.send(headCommand).catch((err) => {
        throw new NotFoundException('File Not Exist !!');
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
