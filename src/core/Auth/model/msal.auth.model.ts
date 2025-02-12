import { Static, Type } from '@sinclair/typebox'

export const MsalCallbackQueryParam = Type.Object({
  code: Type.String(),
  client_info: Type.Optional(Type.String()),
  session_state: Type.Optional(Type.String()),
  state: Type.Optional(Type.String()),
})

export type MsalCallbackQueryParamType = Static<typeof MsalCallbackQueryParam>
