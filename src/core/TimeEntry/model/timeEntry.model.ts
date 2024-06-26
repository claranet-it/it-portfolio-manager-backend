import { Static, Type } from '@sinclair/typebox'

const dateFormat = /([0-9][0-9][0-9][0-9])-(0[1-9]|1[012])-([0-9][0-9])$/
export const TimeEntryReadParam = Type.Object({
  from: Type.RegExp(dateFormat),
  to: Type.RegExp(dateFormat),
})

export type CnaReadParamType = Static<typeof CnaReadParam>

export const CnaReadParam = Type.Object({
  users: Type.Array(Type.String()),
  year: Type.Number(),
  month: Type.Number(),
  company: Type.String(),
})

export type TimeEntryReadParamType = Static<typeof TimeEntryReadParam>

export const TimeEntryReadParamWithUser = Type.Intersect([
  Type.Object({ user: Type.String() }),
  TimeEntryReadParam,
])

export type TimeEntryReadParamWithUserType = Static<
  typeof TimeEntryReadParamWithUser
>

export const TimeEntryRow = Type.Object({
  user: Type.String(),
  date: Type.String(),
  company: Type.String(),
  customer: Type.String(),
  project: Type.String(),
  task: Type.String(),
  hours: Type.Number(),
})

export const TimeEntryRowWithProject = Type.Object({
  user: Type.String(),
  date: Type.String(),
  company: Type.String(),
  customer: Type.String(),
  project: Type.String(),
  projectType: Type.String(),
  task: Type.String(),
  hours: Type.Number(),
})

export const TimeEntryRowList = Type.Array(TimeEntryRow)
export const TimeEntryRowWithProjectList = Type.Array(TimeEntryRowWithProject)

export type TimeEntryRowType = Static<typeof TimeEntryRow>
export type TimeEntryRowWithProjectType = Static<typeof TimeEntryRowWithProject>

export type TimeEntryRowListType = Static<typeof TimeEntryRowList>
export type TimeEntryRowListWithProjectType = Static<typeof TimeEntryRowWithProjectList>

export const InsertTimeEntryRow = Type.Object({
  date: Type.RegExp(dateFormat),
  customer: Type.String(),
  project: Type.String(),
  task: Type.String(),
  hours: Type.Number(),
})

export type InsertTimeEntryRowType = Static<typeof InsertTimeEntryRow>

export const DeleteTimeEntryRow = Type.Object({
  date: Type.RegExp(dateFormat),
  customer: Type.String(),
  project: Type.String(),
  task: Type.String(),
})

export type DeleteTimeEntryRowType = Static<typeof DeleteTimeEntryRow>

export const DeleteTimeEntryWithUser = Type.Intersect([
  Type.Object({ user: Type.String() }),
  DeleteTimeEntryRow,
])

export type deleteTimeEntryWithUserType = Static<typeof DeleteTimeEntryWithUser>
