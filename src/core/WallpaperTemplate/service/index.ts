import { WallpaperTemplateListType } from '../model';
import {
  ListObjectsCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export class WallpaperTemplateService {
  constructor() {}

  async getAll(): Promise<WallpaperTemplateListType> {
    const client = new S3Client();
    const command = new ListObjectsCommand({ Bucket: process.env.WALLPAPER_TEMPLATES_BUCKET });
    const data = await client.send(command);
    const folderMap = {} as WallpaperTemplateListType;

    data.Contents?.forEach((file) => {
      if (!file.Key) return;
      const parts = file.Key.split('/');
      if (parts.length < 2) return; // skip first level files

      const folderName = parts[0];
      const fileName = parts.slice(1).join('/');

      if (!folderMap[folderName]) {
        folderMap[folderName] = [];
      }

      folderMap[folderName].push({ key: file.Key, name: fileName });
    });


    return folderMap;
  }
}
