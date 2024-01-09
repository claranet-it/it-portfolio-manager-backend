import { Static, Type } from '@sinclair/typebox'

export const User = Type.Object({
  email: Type.String(),
  name: Type.String(),
  picture: Type.String(),
})

export type UserType = Static<typeof User>

export const UserProfile = Type.Object({
  crew: Type.String(),
  company: Type.String(),
  name: Type.String(),
})

export type UserProfileType = Static<typeof UserProfile>

export const UserWithProfile = Type.Intersect([User, Type.Partial(UserProfile)])

export type UserWithProfileType = Static<typeof UserWithProfile>

export const UserProfileWithUid = Type.Object({
  uid: Type.String(),
  crew: Type.String(),
  company: Type.String(),
})

export type UserProfileWithUidType = Static<typeof UserProfileWithUid>
