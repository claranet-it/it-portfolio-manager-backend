import { Static, Type } from '@sinclair/typebox'

export const DecodedToken = Type.Object({
  raw: Type.String(),
})

export type DecodedTokenType = Static<typeof DecodedToken>
