import { Static, Type } from '@sinclair/typebox'

export const Skill = Type.Record(
  Type.String(),
  Type.Object({
    averageScore: Type.Number(),
    people: Type.Number(),
  }),
)

export const CompanySkills = Type.Record(
  Type.String(),
  Type.Object({
    company: Type.String(),
    skills: Skill,
  }),
)

export const NetworkingSkillsResponse = Type.Array(CompanySkills)

export type NetworkingSkillsResponseType = Static<
  typeof NetworkingSkillsResponse
>

export const CompanySkill = Type.Object({
  company: Type.String(),
  skill: Type.String(),
  score: Type.Number(),
  uid: Type.String(),
})

export type CompanySkillType = Static<typeof CompanySkill>

export const EffortPeriod = Type.Object({
  month: Type.RegExp(/(0[1-9]|1[012])_([0-9][0-9])$/),
  people: Type.Number(),
  averageConfirmed: Type.Number(),
  averageTentative: Type.Number(),
  averageTotal: Type.Number(),
})

export const Effort = Type.Object({
  skill: Type.String(),
  period: Type.Array(EffortPeriod),
})

export const CompanyEffortRow = Type.Object({
  company: Type.String(),
  uid: Type.String(),
  month_year: Type.RegExp(/(0[1-9]|1[012])_([0-9][0-9])$/),
  confirmedEffort: Type.Number(),
  tentativeEffort: Type.Number(),
})

export type CompanyEffortRowType = Static<typeof CompanyEffortRow>

export const CompanyEffortRowWithSkill = Type.Object({
  company: Type.String(),
  uid: Type.String(),
  month_year: Type.RegExp(/(0[1-9]|1[012])_([0-9][0-9])$/),
  confirmedEffort: Type.Number(),
  tentativeEffort: Type.Number(),
  skill: Type.String(),
})

const EffortRowPerCompany = Type.Object({
  month_year: Type.RegExp(/(0[1-9]|1[012])_([0-9][0-9])$/),
  people: Type.Number(),
  confirmedEffort: Type.Number(),
  tentativeEffort: Type.Number(),
  totalEffort: Type.Number(),
})

export const NetworkingEffortResponsePerCompany = Type.Record(
  Type.String(),
  Type.Array(
    Type.Object({
      skill: Type.String(),
      name: Type.String(),
      effort: Type.Array(EffortRowPerCompany),
    }),
  ),
)

export const NetworkingEffortResponse = Type.Array(
  NetworkingEffortResponsePerCompany,
)

export type NetworkingEffortResponseType = Static<
  typeof NetworkingEffortResponse
>
