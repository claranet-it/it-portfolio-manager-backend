import { Static, Type } from '@sinclair/typebox'

export const Company = Type.Object({
  id: Type.String(),
  domain: Type.String(),
  name: Type.String(),
  image_url: Type.Optional(Type.Union([Type.String(), Type.Null()]))
})

export type CompanyType = Static<typeof Company>

export const CompanyFind = Type.Object({
  name: Type.String(),
})

export type CompanyFindType = Static<typeof CompanyFind>
