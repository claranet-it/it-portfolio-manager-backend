import { Type } from '@sinclair/typebox'

const Experience = Type.Object({
    note: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    year_start: Type.Integer(),
    year_end: Type.Optional(Type.Union([Type.Integer(), Type.Null()])),
    institution: Type.String(),
    current: Type.Optional(Type.Union([Type.Boolean(), Type.Null()])),
    id: Type.Optional(Type.String()),
})

export const ExperienceUpdate = Type.Object({
    note: Type.Optional(Type.String()),
    year_start: Type.Optional(Type.Integer()),
    year_end: Type.Optional(Type.Integer()),
    institution: Type.Optional(Type.String()),
    current: Type.Optional(Type.Boolean()),
})

export const Education = Experience

export const Work = Type.Intersect([
    Experience,
    Type.Object({
        role: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    }),
])