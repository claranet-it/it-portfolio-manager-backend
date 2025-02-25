import { BackgroundTemplateListType } from '@src/core/BackgroundTemplate/model';
import { BackgroundTemplatesBucketInterface } from '@src/core/BackgroundTemplate/backgroundTemplateBucketInterface';

const FAKE_RESPONSE: BackgroundTemplateListType = {
  'background-templates': [
    { key: 'background-templates/background-1.jpg', name: 'background-1.jpg' },
    { key: 'background-templates/background-2.jpg', name: 'background-2.jpg' },
  ],
};

export class FakeBackgroundTemplatesBucket implements BackgroundTemplatesBucketInterface {

  async getAll(): Promise<BackgroundTemplateListType> {
    return FAKE_RESPONSE;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getSignedUrl(key: string): Promise<string> {
    return 'fake-url'
  }
}