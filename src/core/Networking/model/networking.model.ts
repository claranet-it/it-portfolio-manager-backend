import {Static, Type} from '@sinclair/typebox'

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
    company: Type.String(),
    skill: Type.String(),
    score: Type.Number(),
    uid: Type.String(),
})

export type CompanySkillType = Static<typeof CompanySkill>

export const EffortPeriod = Type.Object({
    month: Type.String(),
    people: Type.Number(),
    averageConfirmed: Type.Number(),
    averageTentative: Type.Number(),
    averageTotal: Type.Number(),
})

export const Effort = Type.Object({
    skill: Type.String(),
    period: Type.Array(EffortPeriod),
})

export const CompanyEffort = Type.Object({
    company: Type.String(),
    effort: Type.Array(Effort),
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

export type CompanyEffortWithSkillRowType = Static<typeof CompanyEffortRowWithSkill>

export const NetworkingEffortResponse = Type.Array(CompanyEffort)

export type NetworkingEffortResponseType = Static<
    typeof NetworkingEffortResponse
>