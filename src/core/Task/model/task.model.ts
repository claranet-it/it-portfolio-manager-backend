import { Static, Type } from '@sinclair/typebox'

export const ProjectQueryParam = Type.Object({
  customer: Type.String(),
  completed: Type.Optional(Type.Boolean()),
})

export type ProjectQueryParamType = Static<typeof ProjectQueryParam>

export const CustomerQueryParam = Type.Object({
  completed: Type.Optional(Type.Boolean()),
})

export type CustomerQueryParamType = Static<typeof CustomerQueryParam>

export const ProjectReadParams = Type.Intersect([
  ProjectQueryParam,
  Type.Object({ company: Type.String() }),
])

export type ProjectReadParamsType = Static<typeof ProjectReadParams>

export const CustomerReadParams = Type.Object({
  completed: Type.Optional(Type.Boolean()),
  company: Type.String(),
})

export type CustomerReadParamsType = Static<typeof CustomerReadParams>

export const TaskReadQueryParams = Type.Object({
  customer: Type.String(),
  project: Type.String(),
  completed: Type.Optional(Type.Boolean()),
})

export const ProjectOpt = Type.Object({
  name: Type.Optional(Type.String()),
  type: Type.Optional(Type.String()),
  plannedHours: Type.Optional(Type.Number()),
})

export const Project = Type.Object({
  name: Type.String(),
  type: Type.String(),
  plannedHours: Type.Number(),
  completed: Type.Boolean(),
})

export type ProjectDetailsType = Static<typeof Project>
export const ProjectList = Type.Array(Project)

export type ProjectListType = Static<typeof ProjectList>

export const CustomerProjectUpdateQueryParams = Type.Object({
  customer: Type.String(),
  project: ProjectOpt,
  newCustomer: Type.Optional(Type.String()),
  newProject: Type.Optional(ProjectOpt),
})

export const CustomerProjectParams = Type.Object({
  customer: Type.String(),
  project: Project,
  newCustomer: Type.Optional(Type.String()),
  newProject: Type.Optional(Project),
  completed: Type.Optional(Type.Boolean()),
})

export const CustomerProjectUpdateParams = Type.Intersect([
  CustomerProjectParams,
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

export const Task = Type.Object({
  name: Type.String(),
  completed: Type.Boolean(),
  plannedHours: Type.Number(),
})
export type TaskType = Static<typeof Task>

export const TaskList = Type.Array(Task)

export type TaskListType = Static<typeof TaskList>

export const TaskPropertiesUpdateQueryParams = Type.Object({
  customer: Type.String(),
  project: Type.String(),
  task: Type.String(),
  completed: Type.Optional(Type.Boolean()),
  plannedHours: Type.Optional(Type.Number()),
})
export type TaskPropertiesUpdateQueryParamsType = Static<
  typeof TaskPropertiesUpdateQueryParams
>

const TaskPropertiesUpdateParams = Type.Intersect([
  TaskPropertiesUpdateQueryParams,
  Type.Object({ company: Type.String() }),
])
export type TaskPropertiesUpdateParamsType = Static<
  typeof TaskPropertiesUpdateParams
>

export const TaskStructure = Type.Object({
  customer: Type.String(),
  project: Type.String(),
  task: Type.String(),
})
export type TaskStructureType = Static<typeof TaskStructure>
export const TaskStructureList = Type.Array(TaskStructure)
export type TaskStructureListType = Static<typeof TaskStructureList>
