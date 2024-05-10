import { Static, Type } from '@sinclair/typebox'

export const CustomerReadParams = Type.Object({
  company: Type.String(),
})

export const CustomerList = Type.Array(Type.String())

export type CustomerListType = Static<typeof CustomerList>

export type CustomerReadParamsType = Static<typeof CustomerReadParams>
