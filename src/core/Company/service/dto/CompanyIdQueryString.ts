import { Static, Type } from '@sinclair/typebox'

export const CompanyIdQueryString = Type.Object({
  id: Type.String(),
})

export type CompanyIdQueryStringType = Static<typeof CompanyIdQueryString>
