import { Static, Type } from '@sinclair/typebox'

export const Company = Type.Object({
  name: Type.String(),
  id: Type.String(),
})

export type CompanyType = Static<typeof Company>
