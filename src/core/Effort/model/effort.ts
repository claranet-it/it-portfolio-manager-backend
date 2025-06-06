import { Static, Type } from '@sinclair/typebox'

export const EffortRow = Type.Object({
  uid: Type.String(),
  month_year: Type.RegExp(/(0[1-9]|1[012])_([0-9][0-9])$/),
  confirmedEffort: Type.Number(),
  tentativeEffort: Type.Number(),
  notes: Type.String(),
})

export type EffortRowType = Static<typeof EffortRow>

const EffortRowPerUid = Type.Object({
  month_year: Type.String(),
  confirmedEffort: Type.Number(),
  tentativeEffort: Type.Number(),
  notes: Type.String(),
})

export const EffortResponsePerUid = Type.Record(
  Type.String(),
  Type.Object({
    crew: Type.String(),
    company: Type.String(),
    name: Type.String(),
    effort: Type.Array(EffortRowPerUid),
  }),
)

export type EffortResponsePerUidType = Static<typeof EffortResponsePerUid>

export const EffortResponse = Type.Array(EffortResponsePerUid)

export type EffortResponseType = Static<typeof EffortResponse>

export const EffortQueryParams = Type.Object({
  uid: Type.Optional(Type.String()),
  month_year: Type.Optional(Type.RegExp(/(0[1-9]|1[012])_([0-9][0-9])$/)),
  company: Type.Optional(Type.String()),
  months: Type.Number({ default: 3 }),
})

export type EffortQueryParamsType = Static<typeof EffortQueryParams>

export const EffortReadParams = Type.Intersect([
  EffortQueryParams,
  Type.Object({ company: Type.String() }),
])

export type EffortReadParamsType = Static<typeof EffortReadParams>

export const GetEffortParams = Type.Object({
  uid: Type.Optional(Type.String()),
  month_year: Type.Optional(Type.String()),
})

export type GetEffortParamsType = Static<typeof GetEffortParams>

export const EffortWithUserProfile = Type.Intersect([
  EffortRow,
  Type.Object({
    name: Type.String(),
    crew: Type.String(),
    company: Type.String(),
  }),
])

export type EffortWithUserProfileType = Static<typeof EffortWithUserProfile>
