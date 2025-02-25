import { BackgroundTemplateListType } from './model'

export interface BackgroundTemplatesBucketInterface {
  getAll(): Promise<BackgroundTemplateListType>
  getSignedUrl(key: string): Promise<string>
}
