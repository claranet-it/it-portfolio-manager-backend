import { Static, Type } from '@sinclair/typebox'

export const Company = Type.Object({
  name: Type.String(),
  domain: Type.String(),
})

export type CompanyType = Static<typeof Company>
