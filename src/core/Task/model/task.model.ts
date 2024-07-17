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
export const CustomerProjectUpdateQueryParams = Type.Object({
  customer: Type.String(),
  project: Type.String(),
  newCustomer: Type.Optional(Type.String()),
  newProject: Type.Optional(Type.String()),
})

export const CustomerProjectUpdateParams = Type.Intersect([
  CustomerProjectUpdateQueryParams,
  Type.Object({ company: Type.String() }),
])

export type CustomerProjectUpdateQueryParamsType = Static<
  typeof CustomerProjectUpdateQueryParams
>
export type CustomerProjectUpdateParamsType = Static<
  typeof CustomerProjectUpdateParams
>

export const CustomerProjectDeleteQueryParams = Type.Object({
  customer: Type.String(),
  project: Type.String(),
  inactive: Type.Optional(Type.Boolean({ default: true })),
})

export const CustomerProjectDeleteParams = Type.Intersect([
  CustomerProjectDeleteQueryParams,
  Type.Object({ company: Type.String() }),
])

export type CustomerProjectDeleteQueryParamsType = Static<
  typeof CustomerProjectDeleteQueryParams
>
export type CustomerProjectDeleteParamsType = Static<
  typeof CustomerProjectDeleteParams
>

export const TaskUpdateQueryParams = Type.Object({
  customer: Type.String(),
  project: Type.String(),
  task: Type.String(),
  newTask: Type.String(),
})

export const TaskUpdateParams = Type.Intersect([
  TaskUpdateQueryParams,
  Type.Object({ company: Type.String() }),
])

export type TaskUpdateQueryParamsType = Static<typeof TaskUpdateQueryParams>
export type TaskUpdateParamsType = Static<typeof TaskUpdateParams>

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
