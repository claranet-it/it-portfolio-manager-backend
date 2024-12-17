import { Static, Type } from '@sinclair/typebox'

export const User = Type.Object({
  email: Type.String(),
  name: Type.String(),
  picture: Type.String(),
})

export const UserCompany = Type.Object({
  company: Type.String(),
})

export type UserCompanyType = Static<typeof UserCompany>

export const UserProfile = Type.Object({
  crew: Type.String(),
  company: Type.String(),
  name: Type.String(),
  crewLeader: Type.Boolean(),
  place: Type.String(),
  workingExperience: Type.String(),
  education: Type.String(),
  certifications: Type.String(),
  picture: Type.Optional(Type.String()),
  role: Type.Optional(Type.String()),
})

export type UserProfileType = Static<typeof UserProfile>

export const UserWithProfile = Type.Intersect([User, Type.Partial(UserProfile)])

export type UserWithProfileType = Static<typeof UserWithProfile>

export const UserProfileWithUid = Type.Intersect([
  UserProfile,
  Type.Object({ uid: Type.String() }),
])

export const CompleteUserProfile = Type.Intersect([
  UserProfile,
  Type.Object({ uid: Type.String() }),
  Type.Object({ picture: Type.String() }),
  Type.Object({
    disabled: Type.Optional(Type.Boolean({ default: false })),
    disabledAt: Type.Optional(Type.String()),
  }),
])

export const CnaUserProfile = Type.Object({
  email: Type.String(),
  id: Type.String(),
  name: Type.String(),
})

export type UserProfileWithUidType = Static<typeof UserProfileWithUid>

export type CompleteUserProfileType = Static<typeof CompleteUserProfile>

export const CnaUserProfileList = Type.Array(CnaUserProfile)
export type CnaUserProfileListType = Static<typeof CnaUserProfileList>

export const UpdateUserProfile = Type.Object({
  crew: Type.String(),
  crewLeader: Type.Optional(Type.Boolean()),
  place: Type.Optional(Type.String()),
  workingExperience: Type.Optional(Type.String()),
  education: Type.Optional(Type.String()),
  certifications: Type.Optional(Type.String()),
})

export type UpdateUserProfileType = Static<typeof UpdateUserProfile>

export const UserWithCrew = Type.Object({
  email: Type.String(),
  id: Type.String(),
  name: Type.String(),
  crew: Type.Optional(Type.String()),
  role: Type.Optional(Type.String()),
  disabled: Type.Optional(Type.Boolean({ default: false })),
  disabledAt: Type.Optional(Type.String()),
})
export type UserWithCrewType = Static<typeof UserWithCrew>

export const UserWithCrewList = Type.Array(UserWithCrew)
export type UserWithCrewListType = Static<typeof UserWithCrewList>

const PatchRole = Type.Union([
  Type.Literal('ADMIN'),
  Type.Literal('TEAM_LEADER'),
  Type.Literal(''),
])

export const PatchUserProfile = Type.Object({
  crew: Type.Optional(Type.String()),
  role: Type.Optional(PatchRole),
})

export type PatchUserProfileType = Static<typeof PatchUserProfile>
