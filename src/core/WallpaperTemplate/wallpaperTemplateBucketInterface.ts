import { WallpaperTemplateListType } from './model'

export interface WallpaperTemplatesBucketInterface {
  getAll(): Promise<WallpaperTemplateListType>
  getSignedUrl(key: string): Promise<string>
}
