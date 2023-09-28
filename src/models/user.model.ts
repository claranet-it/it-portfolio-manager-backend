import { Static, Type } from '@sinclair/typebox'

export const User = Type.Object({
  email: Type.String(),
})

export type UserType = Static<typeof User>
