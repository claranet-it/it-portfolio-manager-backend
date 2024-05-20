import { Static, Type } from '@sinclair/typebox'

export const TimeEntryReadParam = Type.Object({
  from: Type.String({format: 'date'}),
  to: Type.String({format: 'date'}),
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
  date: Type.Date(),
  cutomer: Type.String(),
  project: Type.String(),
  task: Type.String(),
  hours: Type.Number(),
})

export const TimeEntryRowList = Type.Array(TimeEntryRow)

export type TimeEntryRowType = Static<typeof TimeEntryRow>

export type TimeEntryRowListType = Static<typeof TimeEntryRowList>
