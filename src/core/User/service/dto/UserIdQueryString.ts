import { Static, Type } from '@sinclair/typebox'

export const UserIdQueryString = Type.Object({
  id: Type.String(),
})

export type UserIdQueryStringType = Static<typeof UserIdQueryString>
