import { Static, Type } from '@sinclair/typebox'

export const BackgroundTemplate = Type.Object({
  name: Type.String(),
  key: Type.String(),
})

export const GetBackgroundTemplateSignedUrl = Type.Object({
  key: Type.String(),
})

export const BackgroundTemplateList = Type.Record(Type.String(), Type.Array(BackgroundTemplate))

export type BackgroundTemplateListType = Static<typeof BackgroundTemplateList>
export type GetBackgroundTemplateSignedUrlType = Static<typeof GetBackgroundTemplateSignedUrl>
