import { WallpaperTemplateListType } from '@src/core/WallpaperTemplate/model';
import { WallpaperTemplatesBucketInterface } from '@src/core/WallpaperTemplate/wallpaperTemplateBucketInterface';

const FAKE_RESPONSE: WallpaperTemplateListType = {
  'wallpaper-templates': [
    { key: 'wallpaper-templates/wallpaper-1.jpg', name: 'wallpaper-1.jpg' },
    { key: 'wallpaper-templates/wallpaper-2.jpg', name: 'wallpaper-2.jpg' },
  ],
};

export class FakeWallpaperTemplatesBucket implements WallpaperTemplatesBucketInterface {

  async getAll(): Promise<WallpaperTemplateListType> {
    return FAKE_RESPONSE;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getSignedUrl(key: string): Promise<string> {
    return 'fake-url'
  }
}