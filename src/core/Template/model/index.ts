import { Static, Type } from '@sinclair/typebox'
import { Customer, ProjectOpt, Task } from '@src/core/Task/model/task.model'

const dateFormat = /([0-9][0-9][0-9][0-9])-(0[1-9]|1[012])-([0-9][0-9])$/
export const Template = Type.Object({
    id: Type.String(),
    email: Type.String({ format: 'email' }),
    timehours: Type.Number(),
    daytime: Type.Array(Type.Integer()),
    date_start: Type.RegExp(dateFormat),
    date_end: Type.RegExp(dateFormat),
    customer: Customer,
    project: ProjectOpt,
    task: Type.Optional(Task),
})

export const TemplateArray = Type.Array(Template)

export const TemplateCreateParams = Type.Object({
    timehours: Type.Number(),
    daytime: Type.Array(Type.Integer()),
    date_start: Type.RegExp(dateFormat),
    date_end: Type.RegExp(dateFormat),
    project_id: Type.String(),
    customer_id: Type.String(),
    task_id: Type.Optional(Type.String()),
})

export const TemplateCreateParamsWithUserEmail = Type.Intersect([
    TemplateCreateParams,
    Type.Object({
        userEmail: Type.String(),
    })
])

export const TemplateUpdate = Type.Object({
    timehours: Type.Optional(Type.Number()),
    daytime: Type.Optional(Type.Array(Type.Integer())),
    date_start: Type.Optional(Type.RegExp(dateFormat)),
    date_end: Type.Optional(Type.RegExp(dateFormat))
})

export type TemplateType = Static<typeof Template>
export type TemplateCreateParamsType = Static<typeof TemplateCreateParams>
export type TemplateCreateParamsWithUserEmailType = Static<typeof TemplateCreateParamsWithUserEmail>
export type TemplateUpdateType = Static<typeof TemplateUpdate>