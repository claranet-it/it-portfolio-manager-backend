import { Static, Type } from '@sinclair/typebox'

const dateFormat = /([0-9][0-9][0-9][0-9])-(0[1-9]|1[012])-([0-9][0-9])$/
export const ReportProjects = Type.Object({
    from: Type.RegExp(dateFormat),
    to: Type.RegExp(dateFormat),
    format: Type.Union([Type.Literal('json'), Type.Literal('csv')]),
    customer: Type.Optional(Type.Array(Type.String())),
    project: Type.Optional(Type.Array(Type.String())),
    task: Type.Optional(Type.Array(Type.String())),
    user: Type.Optional(Type.Array(Type.String())),
    crew: Type.Optional(Type.String()),
})


export type ReportProjectsType = Static<
    typeof ReportProjects
>

export const ReportProjectsWithCompany = Type.Intersect([ReportProjects, Type.Object({
    company: Type.String()
})])

export type ReportProjectsWithCompanyType = Static<
    typeof ReportProjectsWithCompany
>

