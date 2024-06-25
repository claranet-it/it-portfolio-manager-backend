import {Static, Type} from '@sinclair/typebox'

export const ProductivityReportResponse = Type.Record(
    Type.String(),
    Type.Object({
        workedHours: Type.Number(),
        totalTracked: Type.Object({
            billableProductivity: Type.Number(),
            nonBillableProductivity: Type.Number(),
            slackTime: Type.Number(),
            absence: Type.Number(),
        }),
        totalProductivity: Type.Number(),
    }),)

export type ProductivityReportResponseType = Static<typeof ProductivityReportResponse>