import { Static, Type } from '@sinclair/typebox'

export const OauthCallbackQueryParam = Type.Object({
  error: Type.Optional(Type.String()),
  code: Type.Optional(Type.String()),
  state: Type.Optional(Type.String()),
})

export type OauthCallbackQueryParamType = Static<typeof OauthCallbackQueryParam>
