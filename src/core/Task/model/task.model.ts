import { Static, Type } from '@sinclair/typebox'
import {ProjectType} from "@src/core/Report/model/productivity.model";

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

export const ProjectOpt = Type.Object({ name: Type.Optional(Type.String()), type: Type.Optional(Type.String()), plannedHours: Type.Optional(Type.Number()) })

export const Project = Type.Object({ name: Type.String(), type: Type.String(), plannedHours: Type.Number() })

export type ProjectDetailsType = Static<typeof Project>
export const ProjectList = Type.Array(Project)

export type ProjectListType = Static<typeof ProjectList>

export const CustomerProjectUpdateQueryParams = Type.Object({
  customer: Type.String(),
  project: Project,
  newCustomer: Type.Optional(Type.String()),
  newProject: Type.Optional(Project),
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

// export const ProjectTypeUpdateQueryParams = Type.Object({
//   customer: Type.String(),
//   project: Type.String(),
//   newProjectType: Type.String(),
// })
//
// export const ProjectTypeUpdateParams = Type.Intersect([
//   ProjectTypeUpdateQueryParams,
//   Type.Object({ company: Type.String() }),
// ])
//
// export type ProjectTypeUpdateQueryParamsType = Static<
//   typeof ProjectTypeUpdateQueryParams
// >
// export type ProjectTypeUpdateParamsType = Static<typeof ProjectTypeUpdateParams>

export type TaskReadQueryParamsType = Static<typeof TaskReadQueryParams>

export const TaskReadParams = Type.Intersect([
  TaskReadQueryParams,
  Type.Object({ company: Type.String() }),
])

export type TaskReadParamsType = Static<typeof TaskReadParams>

export const TaskCreateQueryParams = Type.Object({
  customer: Type.String(),
  project: ProjectOpt,
  task: Type.String(),
})

export const TaskCreateParams = Type.Object({
  customer: Type.String(),
  project: Project,
  task: Type.String(),
})

export type TaskCreateQueryParamsType = Static<typeof TaskCreateQueryParams>

export const TaskCreateReadParams = Type.Intersect([
  TaskCreateParams,
  Type.Object({ company: Type.String() }),
])

export type TaskCreateReadParamsType = Static<typeof TaskCreateReadParams>

export const CustomerList = Type.Array(Type.String())

export type CustomerListType = Static<typeof CustomerList>

export const TaskList = Type.Array(Type.String())

export type TaskListType = Static<typeof TaskList>
