import { Static, Type } from '@sinclair/typebox'
import { Skill } from '@src/core/Skill/model/Skill'

export const Company = Type.Object({
  id: Type.String(),
  domain: Type.String(),
  name: Type.String(),
  image_url: Type.Optional(Type.Union([Type.String(), Type.Null()])),
})

export type CompanyType = Static<typeof Company>

export const CompanyWithSkills = Type.Intersect([
  Company,
  Type.Object({
    skills: Type.Optional(Type.Array(Skill, { default: [] })),
  }),
])

export type CompanyWithSkillsType = Static<typeof CompanyWithSkills>

export const CompanyFind = Type.Object({
  name: Type.String(),
})

export type CompanyFindType = Static<typeof CompanyFind>
