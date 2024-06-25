import { Static, Type } from '@sinclair/typebox'

export const User = Type.Object({
  email: Type.String(),
  name: Type.String(),
  picture: Type.String(),
})

export const TotalTracked = Type.Object({
  billableProductivity: Type.Number(),
  nonBillableProductivity: Type.Number(),
  slackTime: Type.Number(),
  absence: Type.Number(),
})

export const UserProductivity = Type.Object({
  user: User,
  workedHours: Type.Number(),
  totalTracked: TotalTracked,
  totalProductivity: Type.Number(),
})

export const ProductivityReportResponse = Type.Array(UserProductivity)

export type ProductivityReportResponseType = Static<
  typeof ProductivityReportResponse
>
