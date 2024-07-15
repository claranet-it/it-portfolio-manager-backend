import { Static, Type } from '@sinclair/typebox'

export const ProjectQueryParam = Type.Object({
  customer: Type.String(),
})

export type ProjectQueryParamType = Static<typeof ProjectQueryParam>

export const ProjectReadParams = Type.Intersect([
  ProjectQueryParam,
  Type.Object({ company: Type.String() }),
])

export type ProjectReadParamsType = Static<typeof ProjectReadParams>

export const TaskReadQueryParams = Type.Object({
  customer: Type.String(),
  project: Type.String(),
})

export type TaskReadQueryParamsType = Static<typeof TaskReadQueryParams>

export const TaskReadParams = Type.Intersect([
  TaskReadQueryParams,
  Type.Object({ company: Type.String() }),
])

export type TaskReadParamsType = Static<typeof TaskReadParams>

export const TaskCreateQueryParams = Type.Object({
  customer: Type.String(),
  project: Type.String(),
  projectType: Type.String(),
  task: Type.String(),
})

export type TaskCreateQueryParamsType = Static<typeof TaskCreateQueryParams>

export const TaskCreateReadParams = Type.Intersect([
  TaskCreateQueryParams,
  Type.Object({ company: Type.String() }),
])

export type TaskCreateReadParamsType = Static<typeof TaskCreateReadParams>

export const CustomerList = Type.Array(Type.String())

export type CustomerListType = Static<typeof CustomerList>

export const ProjectList = Type.Array(Type.String())

export type ProjectListType = Static<typeof ProjectList>

export const TaskList = Type.Array(Type.String())

export type TaskListType = Static<typeof TaskList>
