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

const dateFormat = /([0-9][0-9][0-9][0-9])-(0[1-9]|1[012])-([0-9][0-9])$/
export const ProductivityReportReadParam = Type.Object({
  from: Type.RegExp(dateFormat),
  to: Type.RegExp(dateFormat),
})

export type ProductivityReportReadParamType = Static<
  typeof ProductivityReportReadParam
>

export const ProductivityReportReadParamWithCompany = Type.Intersect([
  Type.Object({ company: Type.String() }),
  ProductivityReportReadParam,
])

export type ProductivityReportReadParamWithCompanyType = Static<
  typeof ProductivityReportReadParamWithCompany
>

export const ProductivityReportResponse = Type.Array(UserProductivity)

export type ProductivityReportResponseType = Static<
  typeof ProductivityReportResponse
>

export enum ProjectType {
  absence = 'absence',
  billable = 'billable',
  non_billable = 'non_billable',
  slack_time = 'slack_time',
}
