import { Static, Type } from '@sinclair/typebox'

export const User = Type.Object({
  email: Type.String(),
  name: Type.String(),
  picture: Type.String(),
})

export const TotalTracked = Type.Object({
  billable: Type.Number(),
  'non-billable': Type.Number(),
  'slack-time': Type.Number(),
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
  customer: Type.Optional(Type.String()),
  project: Type.Optional(Type.String()),
  task: Type.Optional(Type.String()),
  name: Type.Optional(Type.String()),
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
  ABSENCE = 'absence',
  BILLABLE = 'billable',
  NON_BILLABLE = 'non-billable',
  SLACK_TIME = 'slack-time',
}
