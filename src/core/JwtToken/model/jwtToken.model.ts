import { Static, Type } from '@sinclair/typebox'

export const JwtToken = Type.Object({
  email: Type.String(),
  name: Type.String(),
  picture: Type.String(),
  company: Type.String(),
  role: Type.Optional(Type.String()),
})

export type JwtTokenType = Static<typeof JwtToken>

export const JwtInvalidToken = Type.Object({
  email_invalid: Type.String(),
  name_invalid: Type.String(),
  picture_invalid: Type.String(),
})

export type JwtInvalidTokenType = Static<typeof JwtInvalidToken>
