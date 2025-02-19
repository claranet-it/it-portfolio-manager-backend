import { Static, Type } from '@sinclair/typebox'

export const WallpaperTemplate = Type.Object({
  name: Type.String(),
  key: Type.String(),
})

export const WallpaperTemplateList = Type.Record(Type.String(), Type.Array(WallpaperTemplate))
export type WallpaperTemplateListType = Static<typeof WallpaperTemplateList>
