import { GetObjectCommand, ListObjectsCommand, NoSuchKey, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BackgroundTemplateListType } from '@src/core/BackgroundTemplate/model';
import { BackgroundTemplatesBucketInterface } from '@src/core/BackgroundTemplate/backgroundTemplateBucketInterface';
import { BadRequestException } from '@src/shared/exceptions/BadRequestException';

export class BackgroundTemplatesBucket implements BackgroundTemplatesBucketInterface {

  s3Client: S3Client;
  constructor() {
    this.s3Client = new S3Client();
  }

  async getAll(): Promise<BackgroundTemplateListType> {
    const command = new ListObjectsCommand({ Bucket: process.env.BACKGROUND_TEMPLATES_BUCKET });
    const data = await this.s3Client.send(command);
    const folderMap = {} as BackgroundTemplateListType;

    data.Contents?.forEach((file) => {
      if (!file.Key) return;
      const parts = file.Key.split('/');
      if (parts.length < 2) return; // skip first level files

      const folderName = parts[0];
      const fileName = parts.slice(1).join('/').replace(/\.[^/.]+$/, '');

      if (!folderMap[folderName]) {
        folderMap[folderName] = [];
      }

      folderMap[folderName].push({ key: file.Key, name: fileName });
    });

    return folderMap;
  }

  async getSignedUrl(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({ Bucket: process.env.BACKGROUND_TEMPLATES_BUCKET, Key: key });
      await this.s3Client.send(command);
      const url = await getSignedUrl(this.s3Client, command);
      return url;
    } catch (error) {
      if (error instanceof NoSuchKey) {
        throw new BadRequestException('Key not found');
      } else {
        throw new Error('Error getting signed url');
      }
    }
  }
  
}