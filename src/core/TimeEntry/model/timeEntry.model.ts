import { Static, Type } from '@sinclair/typebox'


const dateFormat = /([0-9][0-9][0-9][0-9])-(0[1-9]|1[012])-([0-9][0-9])$/
export const TimeEntryReadParam = Type.Object({
  from: Type.RegExp(dateFormat),
  to: Type.RegExp(dateFormat),
})

export type TimeEntryReadParamType = Static <typeof TimeEntryReadParam>

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
  cutomer: Type.String(),
  project: Type.String(),
  task: Type.String(),
  hours: Type.Number(),
})

export const TimeEntryRowList = Type.Array(TimeEntryRow)

export type TimeEntryRowType = Static<typeof TimeEntryRow>

export type TimeEntryRowListType = Static<typeof TimeEntryRowList>
