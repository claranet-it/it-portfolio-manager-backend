import { BackgroundTemplateListType } from '../model';
import { BackgroundTemplatesBucket } from '@src/infrastructure/BackgroundTemplate/BackgroundTemplatesBucket';
import { BackgroundTemplatesBucketInterface } from '../backgroundTemplateBucketInterface';
import { FakeBackgroundTemplatesBucket } from '@src/infrastructure/BackgroundTemplate/FakeBackgroundTemplatesBucket';

export class BackgroundTemplateService {
  backgroundTemplatesBucket: BackgroundTemplatesBucketInterface;
  constructor() {
    this.backgroundTemplatesBucket = process.env.STAGE_NAME === 'test' ? new FakeBackgroundTemplatesBucket() : new BackgroundTemplatesBucket();
  }

  async getAll(): Promise<BackgroundTemplateListType> {
    return this.backgroundTemplatesBucket.getAll();
  }

  async getSignedUrl(key: string): Promise<string> {
    if (!key) {
      throw new Error('Key is required');
    }
    return this.backgroundTemplatesBucket.getSignedUrl(key);
  }
}
