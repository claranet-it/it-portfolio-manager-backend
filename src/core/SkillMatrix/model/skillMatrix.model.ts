import { Static, Type } from '@sinclair/typebox'

export const SkillMatrixRow = Type.Object({
  uid: Type.String(),
  company: Type.String(),
  crew: Type.String(),
  name: Type.String(),
  skill: Type.String(),
  skillCategory: Type.String(),
  score: Type.Number({ minimum: 0, maximum: 3 }),
  updatedAt: Type.String(),
})

export type SkillMatrixRowType = Static<typeof SkillMatrixRow>

export const SkillMatrixMineResponse = Type.Array(SkillMatrixRow)

export const getMinimumScore = (): number => {
  return SkillMatrixRow.properties.score.minimum
    ? SkillMatrixRow.properties.score.minimum
    : 0
}

export const getMaximumScore = (): number => {
  return SkillMatrixRow.properties.score.maximum
    ? SkillMatrixRow.properties.score.maximum
    : 0
}

export type SkillMatrixMineResponseType = Static<typeof SkillMatrixMineResponse>

export const SkillMatrixQueryParams = Type.Object({
  uid: Type.Optional(Type.String()),
  company: Type.Optional(Type.String()),
})

export type SkillMatrixQueryParamsType = Static<typeof SkillMatrixQueryParams>

export const SkillMatrixReadParams = Type.Object({
  company: Type.String({ minLength: 1 }),
})

export type SkillMatrixReadParamsType = Static<typeof SkillMatrixReadParams>

export const SkillMatrixUpdateParams = Type.Object({
  skill: Type.String(),
  score: Type.Number({
    minimum: getMinimumScore(),
    maximum: getMaximumScore(),
  }),
  skillCategory: Type.String(),
})

export type SkillMatrixUpdateParamsType = Static<typeof SkillMatrixUpdateParams>

export const SkillMatrixUpdateOfUserParams = Type.Object({
  uid: Type.String(),
  crew: Type.Optional(Type.String()),
  company: Type.Optional(Type.String()),
  name: Type.Optional(Type.String()),
})

export type SkillMatrixUpdateOfUserParamsType = Static<
  typeof SkillMatrixUpdateOfUserParams
>

const SkillMatrixSkills = Type.Record(
  Type.String(),
  Type.Number({ default: 0 }),
)

export type SkillMatrixSkillsType = Static<typeof SkillMatrixSkills>

const SkillMatrixResponseRowPerUid = Type.Object({
  company: Type.String(),
  crew: Type.String(),
  skills: SkillMatrixSkills,
})

export const SkillMatrixResponsePerUid = Type.Record(
  Type.String(),
  SkillMatrixResponseRowPerUid,
)

export type SkillMatrixResponsePerUidType = Static<
  typeof SkillMatrixResponsePerUid
>

export const SkillMatrixResponse = Type.Array(SkillMatrixResponsePerUid)

export type SkillMatrixResponseType = Static<typeof SkillMatrixResponse>

export const Skill = Type.Object({
  skill: Type.String(),
  averageScore: Type.Number(),
  people: Type.Number(),
})

export type SkillType = Static<typeof Skill>

export const CompanySkills = Type.Object({
  company: Type.String(),
  skills: Type.Array(Skill),
})

export const NetworkingSkillsResponse = Type.Array(CompanySkills)

export type NetworkingSkillsResponseType = Static<
  typeof NetworkingSkillsResponse
>

export const CompanySkill = Type.Object({
  skill: Type.String(),
  score: Type.Number(),
  company: Type.String(),
})

export type CompanySkillType = Static<typeof CompanySkill>
