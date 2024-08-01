import { Static, Type } from '@sinclair/typebox'
import { Project } from '@src/core/Task/model/task.model'

const dateFormat = /([0-9][0-9][0-9][0-9])-(0[1-9]|1[012])-([0-9][0-9])$/
export const TimeEntryReadParam = Type.Object({
  from: Type.RegExp(dateFormat),
  to: Type.RegExp(dateFormat),
})

export type CnaReadParamType = Static<typeof CnaReadParam>

export const CnaReadParam = Type.Object({
  company: Type.String(),
  year: Type.Number(),
  month: Type.Number(),
})

export type TimeEntryReadParamType = Static<typeof TimeEntryReadParam>

export const TimeEntryReadParamWithCrew = Type.Object({
  from: Type.RegExp(dateFormat),
  to: Type.RegExp(dateFormat),
  crew: Type.Optional(Type.String()),
  format: Type.Union([Type.Literal('json'), Type.Literal('csv')]),
})

export type TimeEntryReadParamWithCrewType = Static<
  typeof TimeEntryReadParamWithCrew
>
export const TimeEntryReadParamWithCompanyAndCrew = Type.Intersect([
  TimeEntryReadParamWithCrew,
  Type.Object({ company: Type.String() }),
])

export type TimeEntryReadParamWithCompanyAndCrewType = Static<
  typeof TimeEntryReadParamWithCompanyAndCrew
>

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
  description: Type.String(),
  startHour: Type.String(),
  endHour: Type.String(),
  index: Type.Optional(Type.Number()),
})

export const TimeEntryReport = Type.Object({
  date: Type.String(),
  email: Type.String(),
  name: Type.String(),
  company: Type.String(),
  crew: Type.String(),
  customer: Type.String(),
  project: Type.String(),
  task: Type.String(),
  projectType: Type.String(),
  plannedHours: Type.Number(),
  hours: Type.Number(),
  description: Type.String(),
  startHour: Type.String(),
  endHour: Type.String(),
})

export const TimeEntryReportList = Type.Array(TimeEntryReport)
export type TimeEntryReportType = Static<typeof TimeEntryReport>
export type TimeEntryReportListType = Static<typeof TimeEntryReportList>

export const TimeEntriesForCna = Type.Object({
  description: Type.String(),
  user: Type.Object({ email: Type.String(), name: Type.String() }),
  userId: Type.String(),
  billable: Type.Boolean(),
  task: Type.Object({ name: Type.String() }),
  project: Type.Object({
    name: Type.String(),
    billable: Type.Boolean(),
    clientName: Type.String(),
  }),
  timeInterval: Type.Object({
    start: Type.String(),
    end: Type.String(),
    duration: Type.String(),
  }),
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
  timeEntryDate: Type.String(),
})

export const TimeEntryRowWithProjectEntity = Type.Object({
  user: Type.String(),
  date: Type.String(),
  company: Type.String(),
  customer: Type.String(),
  project: Project,
  task: Type.String(),
  hours: Type.Number(),
  description: Type.String(),
  startHour: Type.String(),
  endHour: Type.String(),
  index: Type.Optional(Type.Number()),
})

export const TimeEntryRowList = Type.Array(TimeEntryRow)
export type TimeEntryRowType = Static<typeof TimeEntryRow>
export type TimeEntryRowListType = Static<typeof TimeEntryRowList>

export type TimeEntryRowWithProjectType = Static<typeof TimeEntryRowWithProject>

export type TimeEntryRowWithProjectEntityType = Static<
  typeof TimeEntryRowWithProjectEntity
>
export const TimeEntryRowWithProjectEntityList = Type.Array(
  TimeEntryRowWithProjectEntity,
)
export type TimeEntryRowWithProjectEntityListType = Static<
  typeof TimeEntryRowWithProjectEntityList
>

export const TimeEntriesForCnaList = Type.Array(TimeEntriesForCna)
export type TimeEntriesForCnaListType = Static<typeof TimeEntriesForCnaList>
export type TimeEntriesForCnaType = Static<typeof TimeEntriesForCna>

export const InsertTimeEntryRow = Type.Object({
  date: Type.RegExp(dateFormat),
  customer: Type.String(),
  project: Type.String(),
  task: Type.String(),
  hours: Type.Number(),
  description: Type.Optional(Type.String()),
  startHour: Type.Optional(Type.String()),
  endHour: Type.Optional(Type.String()),
})

export type InsertTimeEntryRowType = Static<typeof InsertTimeEntryRow>

export const DeleteTimeEntryRow = Type.Object({
  date: Type.RegExp(dateFormat),
  customer: Type.String(),
  project: Type.String(),
  task: Type.String(),
  index: Type.Optional(Type.Number()),
})

export type DeleteTimeEntryRowType = Static<typeof DeleteTimeEntryRow>

export const DeleteTimeEntryWithUser = Type.Intersect([
  Type.Object({ user: Type.String() }),
  DeleteTimeEntryRow,
])

export type deleteTimeEntryWithUserType = Static<typeof DeleteTimeEntryWithUser>
