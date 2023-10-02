import { Static, Type } from '@sinclair/typebox'

export const JwtToken = Type.Object({
  email: Type.String(),
  name: Type.String(),
  picture: Type.String(),
})

export type JwtTokenType = Static<typeof JwtToken>
