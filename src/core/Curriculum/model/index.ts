import { Static, Type } from '@sinclair/typebox'


const Education = Type.Object({
    note: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    year_start: Type.Integer(),
    year_end: Type.Optional(Type.Union([Type.Integer(), Type.Null()])),
    institution: Type.String(),
    current: Type.Optional(Type.Union([Type.Boolean(), Type.Null()])),
})

const Work = Type.Object({
    note: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    year_start: Type.Integer(),
    year_end: Type.Optional(Type.Union([Type.Integer(), Type.Null()])),
    institution: Type.String(),
    current: Type.Optional(Type.Union([Type.Boolean(), Type.Null()])),
    role: Type.Optional(Type.Union([Type.String(), Type.Null()])),
})

export const Curriculum = Type.Object({
    name: Type.String(),
    role: Type.String(),
    email: Type.String({ format: 'email' }),
    summary: Type.Optional(Type.String()),
    main_skills: Type.Optional(Type.String()),
    education: Type.Array(Education),
    work: Type.Array(Work)
})

export const CurriculumWithUserEmail = Type.Intersect([
    Curriculum,
    Type.Object({
        userEmail: Type.String(),
    }),
])

export const GetCurriculumByEmail = Type.Object({
    email: Type.String({ format: 'email' }),
})

export const DeleteItemCurriculum = Type.Object({
    id: Type.String(),
})

export type DeleteItemCurriculumType = Static<typeof DeleteItemCurriculum>
export type CurriculumType = Static<typeof Curriculum>
export type CurriculumWithUserEmailType = Static<
    typeof CurriculumWithUserEmail
>
export type GetCurriculumByEmailType = Static<typeof GetCurriculumByEmail>
