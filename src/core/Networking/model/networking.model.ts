import { Static, Type } from '@sinclair/typebox'

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
