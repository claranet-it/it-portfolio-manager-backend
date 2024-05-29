import { Static, Type } from '@sinclair/typebox'

export const CustomerReadParams = Type.Object({
  company: Type.String(),
})

export type CustomerReadParamsType = Static<typeof CustomerReadParams>

export const ProjectQueryParam = Type.Object({
  customer: Type.String(),
})

export type ProjectQueryParamType = Static<typeof ProjectQueryParam>

export const ProjectReadParams = Type.Intersect([
  ProjectQueryParam,
  Type.Object({ company: Type.String() }),
])

export type ProjectReadParamsType = Static<typeof ProjectReadParams>

export const TaskReadParams = Type.Object({
  company: Type.String(),
  customer: Type.String(),
  project: Type.String(),
})

export type TaskReadParamType = Static<typeof TaskReadParams>

export const TaskQueryParam = Type.Object({
  customer: Type.String(),
  project: Type.String(),
  task: Type.String(),
})

export type TaskQueryParamType = Static<typeof TaskQueryParam>

export const TaskCreateParams = Type.Intersect([
  TaskQueryParam,
  Type.Object({ company: Type.String() }),
])

export type TaskCreateParamType = Static<typeof TaskCreateParams>

export const CustomerList = Type.Array(Type.String())

export type CustomerListType = Static<typeof CustomerList>

export const ProjectList = Type.Array(Type.String())

export type ProjectListType = Static<typeof ProjectList>

export const TaskList = Type.Array(Type.String())

export type TaskListType = Static<typeof TaskList>
