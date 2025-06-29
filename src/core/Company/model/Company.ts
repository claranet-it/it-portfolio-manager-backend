import { Static, Type } from '@sinclair/typebox'
import { Skill } from '@src/core/Skill/model/Skill'

export const Company = Type.Object({
  id: Type.String(),
  domain: Type.String(),
  name: Type.String(),
  image_url: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  primary_contact: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  company_master: Type.Boolean(),
})

export type CompanyType = Static<typeof Company>

export const CompaniesArray = Type.Array(Company)

export type CompaniesConnectionType = { requester: CompanyType, correspondent: CompanyType }[]

export const CompaniesConnections = Type.Array(Type.Object({
  requester: Company,
  correspondent: Company,
}));

export type CompaniesArrayType = Static<typeof CompaniesArray>

export const CompanyWithSkills = Type.Intersect([
  Company,
  Type.Object({
    skills: Type.Optional(Type.Array(Skill, { default: [] })),
  }),
])

export type CompanyWithSkillsType = Static<typeof CompanyWithSkills>

export const CompanyFind = Type.Object({
  domain: Type.Optional(Type.String()),
  name: Type.Optional(Type.String()),
})

export type CompanyFindType = Static<typeof CompanyFind>
