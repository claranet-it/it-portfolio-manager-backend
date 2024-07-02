import { Static, Type } from '@sinclair/typebox'

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
})

export const TimeEntryRowList = Type.Array(TimeEntryRow)
export type TimeEntryRowType = Static<typeof TimeEntryRow>
export type TimeEntryRowListType = Static<typeof TimeEntryRowList>

export type TimeEntryRowWithProjectType = Static<typeof TimeEntryRowWithProject>

export const TimeEntriesForCnaList = Type.Array(TimeEntriesForCna)
export type TimeEntriesForCnaListType = Static<typeof TimeEntriesForCnaList>
export type TimeEntriesForCnaType = Static<typeof TimeEntriesForCna>

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
