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
  crewLeader: Type.Boolean(),
  place: Type.String(),
  workingExperience: Type.String(),
  education: Type.String(),
  certifications: Type.String(),
})

export type UserProfileType = Static<typeof UserProfile>

export const UserWithProfile = Type.Intersect([User, Type.Partial(UserProfile)])

export type UserWithProfileType = Static<typeof UserWithProfile>

export const UserProfileWithUid = Type.Intersect([
  UserProfile,
  Type.Object({ uid: Type.String() }),
])

export type UserProfileWithUidType = Static<typeof UserProfileWithUid>

export const UpdateUserProfile = Type.Object({
  crew: Type.String(),
  crewLeader: Type.Optional(Type.Boolean()),
  place: Type.Optional(Type.String()),
  workingExperience: Type.Optional(Type.String()),
  education: Type.Optional(Type.String()),
  certifications: Type.Optional(Type.String()),
})

export type UpdateUserProfileType = Static<typeof UpdateUserProfile>
