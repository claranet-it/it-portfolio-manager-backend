import { WallpaperTemplateListType } from '../model';
import { WallpaperTemplatesBucket } from '@src/infrastructure/WallpaperTemplate/WallpaperTemplatesBucket';
import { WallpaperTemplatesBucketInterface } from '../wallpaperTemplateBucketInterface';
import { FakeWallpaperTemplatesBucket } from '@src/infrastructure/WallpaperTemplate/FakeWallpaperTemplatesBucket';

export class WallpaperTemplateService {
  wallpaperTemplatesBucket: WallpaperTemplatesBucketInterface;
  constructor() {
    this.wallpaperTemplatesBucket = process.env.STAGE_NAME === 'test' ? new FakeWallpaperTemplatesBucket() : new WallpaperTemplatesBucket();
  }

  async getAll(): Promise<WallpaperTemplateListType> {
    return this.wallpaperTemplatesBucket.getAll();
  }

  async getSignedUrl(key: string): Promise<string> {
    if (!key) {
      throw new Error('Key is required');
    }
    return this.wallpaperTemplatesBucket.getSignedUrl(key);
  }
}
