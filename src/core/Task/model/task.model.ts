import { Static, Type } from '@sinclair/typebox'

/**
 * Customer Structure Model
 * **/

export const Customer = Type.Object({
  id: Type.String(),
  name: Type.String(),
});
export type CustomerType = Static<typeof Customer>

export const CustomerOpt = Type.Object({
  id: Type.Optional(Type.String()),
  name: Type.String(),
});
export type CustomerOptType = Static<typeof CustomerOpt>


export const CustomerProjectDeleteQueryParams = Type.Object({
  customer: Type.String(),
  project: Type.String(),
  inactive: Type.Optional(Type.Boolean({ default: true })),
})
export type CustomerProjectDeleteQueryParamsType = Static<
  typeof CustomerProjectDeleteQueryParams>


export const CustomerProjectDeleteParams = Type.Intersect([
  CustomerProjectDeleteQueryParams,
  Type.Object({ company: Type.String() }),
])
export type CustomerProjectDeleteParamsType = Static<
  typeof CustomerProjectDeleteParams
>

export const CustomerQueryParam = Type.Object({
  completed: Type.Optional(Type.Boolean()),
})
export type CustomerQueryParamType = Static<typeof CustomerQueryParam>


export const CustomerReadParams = Type.Object({
  completed: Type.Optional(Type.Boolean()),
  company: Type.String(),
})
export type CustomerReadParamsType = Static<typeof CustomerReadParams>

/**
 * Project Structure Model
 * **/
export const Project = Type.Object({
  id: Type.Optional(Type.String()),
  name: Type.String(),
  type: Type.String(),
  plannedHours: Type.Number(),
  completed: Type.Boolean(),
})
export type ProjectDetailsType = Static<typeof Project>
export const ProjectList = Type.Array(Project)
export type ProjectListType = Static<typeof ProjectList>


export const CustomerProjectParams = Type.Object({
  customer: Type.String(),
  project: Type.String(),
  newCustomerName: Type.Optional(Type.String()),
  newProject: Type.Optional(Project),
  completed: Type.Optional(Type.Boolean()),
})
export const CustomerProjectUpdateParams = Type.Intersect([
  CustomerProjectParams,
  Type.Object({ company: Type.String() }),
])
export type CustomerProjectUpdateParamsType = Static<
  typeof CustomerProjectUpdateParams
>

export const ProjectOpt = Type.Object({
  name: Type.Optional(Type.String()),
  type: Type.Optional(Type.String()),
  plannedHours: Type.Optional(Type.Number()),
})
export const CustomerProjectUpdateQueryParams = Type.Object({
  customer: Type.String(),
  project: Type.String(),
  newCustomer: Type.Optional(Type.String()),
  newProject: Type.Optional(ProjectOpt),
})
export type CustomerProjectUpdateQueryParamsType = Static<
  typeof CustomerProjectUpdateQueryParams
>


export const ProjectQueryParam = Type.Object({
  customer: Type.String(),
  completed: Type.Optional(Type.Boolean()),
})
export type ProjectQueryParamType = Static<typeof ProjectQueryParam>


export const ProjectReadParams = Type.Intersect([
  ProjectQueryParam,
  Type.Object({ company: Type.String() }),
])
export type ProjectReadParamsType = Static<typeof ProjectReadParams>




/**
 * Task Structure Model
 * **/

export const Task = Type.Object({
  name: Type.String(),
  completed: Type.Boolean(),
  plannedHours: Type.Number(),
})
export type TaskType = Static<typeof Task>

export const TaskMin = Type.Object({
  name: Type.String(),
  id: Type.String(),
})

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
  customer: Customer,
  project: Type.String(),
  task: Type.String(),
})
export type TaskStructureType = Static<typeof TaskStructure>

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

export const TaskReadQueryParams = Type.Object({
  customer: Type.String(),
  project: Type.String(),
  completed: Type.Optional(Type.Boolean()),
})
export type TaskReadQueryParamsType = Static<typeof TaskReadQueryParams>

export const TaskReadParams = Type.Intersect([
  TaskReadQueryParams,
  Type.Object({ company: Type.String() }),
])

export type TaskReadParamsType = Static<typeof TaskReadParams>

export const TaskCreateQueryParams = Type.Object({
  customer: CustomerOpt,
  project: ProjectOpt,
  task: Type.String(),
})

export const TaskCreateParams = Type.Object({
  customer: CustomerOpt,
  project: Project,
  task: Type.String(),
})

export type TaskCreateQueryParamsType = Static<typeof TaskCreateQueryParams>

export const TaskCreateReadParams = Type.Intersect([
  TaskCreateParams,
  Type.Object({ company: Type.String() }),
])

export type TaskCreateReadParamsType = Static<typeof TaskCreateReadParams>
