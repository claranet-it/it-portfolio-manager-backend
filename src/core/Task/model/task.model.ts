import { Static, Type } from '@sinclair/typebox'

export const CustomerReadParams = Type.Object({
  company: Type.String(),
})

export type CustomerReadParamsType = Static<typeof CustomerReadParams>

export const ProjectReadParams = Type.Object({
  company: Type.String(),
  customer: Type.String(),
})

export type ProjectReadParamsType = Static<typeof ProjectReadParams>

export const TaskReadParams = Type.Object({
  company: Type.String(),
  customer: Type.String(),
  project: Type.String(),
})

export type TaskReadParamType = Static<typeof TaskReadParams>

export const TaskCreateParams = Type.Object({
  company: Type.String(),
  customer: Type.String(),
  project: Type.String(),
  task: Type.String(),
})

export type TaskCreateParamType = Static<typeof TaskCreateParams>

export const CustomerList = Type.Array(Type.String())

export type CustomerListType = Static<typeof CustomerList>

export const ProjectList = Type.Array(Type.String())

export type ProjectListType = Static<typeof ProjectList>

export const TaskList = Type.Array(Type.String())

export type TaskListType = Static<typeof TaskList>
