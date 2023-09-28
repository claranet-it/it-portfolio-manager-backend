import { Static, Type } from '@sinclair/typebox'

export const JwtToken = Type.Object({
  'https://claranet/email': Type.String(),
})

export type JwtTokenType = Static<typeof JwtToken>
