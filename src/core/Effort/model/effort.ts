import { Static, Type } from '@sinclair/typebox'

export const EffortRow = Type.Object({
  uid: Type.String(),
  month_year: Type.String(),
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
  Type.Array(EffortRowPerUid),
)

export type EffortResponsePerUidType = Static<typeof EffortResponsePerUid>

export const EffortResponse = Type.Array(EffortResponsePerUid)

export type EffortResponseType = Static<typeof EffortResponse>

export const EffortReadParams = Type.Object({
  uid: Type.Optional(Type.String()),
})

export type EffortReadParamsType = Static<typeof EffortReadParams>
