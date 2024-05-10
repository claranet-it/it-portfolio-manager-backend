import { Static, Type } from '@sinclair/typebox'

export const CustomerReadParams = Type.Object({
  company: Type.String(),
})

export type CustomerReadParamsType = Static<typeof CustomerReadParams>

export const ProjectReadParams = Type.Object({
  company: Type.String(),
  customer: Type.String()
})

export type ProjectReadParamsType = Static<typeof ProjectReadParams>

export const CustomerList = Type.Array(Type.String())

export type CustomerListType = Static<typeof CustomerList>

export const ProjectList = Type.Array(Type.String())

export type ProjectListType = Static<typeof ProjectList>



