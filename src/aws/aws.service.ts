import { Injectable } from '@nestjs/common';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsService {
  private s3: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({ region: 'ap-northeast-2' });
  }

  public async createUploadPresignedUrl(key: string, contentType?: string) {
    const bucketName = this.configService.get<string>('CONTENT_S3_BUCKET_NAME');
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType || 'application/octet-stream',
    });

    return getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }

  public async createDownloadPresignedUrl(
    key: string,
    name: string,
    extension: string | null,
  ) {
    const bucketName = this.configService.get<string>('CONTENT_S3_BUCKET_NAME');
    const fileName = `${name}.${extension}`;
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${fileName}"`,
    });

    return getSignedUrl(this.s3, command, { expiresIn: 600 });
  }
}
