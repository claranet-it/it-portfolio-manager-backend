import { Static, Type } from '@sinclair/typebox'

const Experience = Type.Object({
    note: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    year_start: Type.Integer(),
    year_end: Type.Optional(Type.Union([Type.Integer(), Type.Null()])),
    institution: Type.String(),
    current: Type.Optional(Type.Union([Type.Boolean(), Type.Null()])),
    id: Type.Optional(Type.String()),
})

const Education = Experience

const Work = Type.Intersect([
    Experience,
    Type.Object({
        role: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    }),
])

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

export const IdQueryString = Type.Object({
    id: Type.String(),
})

export const GetCurriculumByEmail = Type.Object({
    email: Type.String({ format: 'email' }),
})

export const CurriculumUpdate = Type.Object({
    role: Type.Optional(Type.String()),
    summary: Type.Optional(Type.String()),
    main_skills: Type.Optional(Type.String()),
})

export const CurriculumUpdateWithUserEmail = Type.Intersect([
    CurriculumUpdate,
    Type.Object({
        userEmail: Type.String(),
    }),
])

const ExperienceUpdate = Type.Object({
    note: Type.Optional(Type.String()),
    year_start: Type.Optional(Type.Integer()),
    year_end: Type.Optional(Type.Integer()),
    institution: Type.Optional(Type.String()),
    current: Type.Optional(Type.Boolean()),
})

export const EducationUpdate = ExperienceUpdate

export const WorkUpdate = Type.Intersect([
    ExperienceUpdate, Type.Object({
        role: Type.Optional(Type.String()),
    })
])

export type IdQueryStringType = Static<typeof IdQueryString>
export type CurriculumType = Static<typeof Curriculum>
export type CurriculumWithUserEmailType = Static<
    typeof CurriculumWithUserEmail
>
export type GetCurriculumByEmailType = Static<typeof GetCurriculumByEmail>
export type CurriculumUpdateType = Static<typeof CurriculumUpdate>
export type CurriculumUpdateWithUserEmailType = Static<
    typeof CurriculumUpdateWithUserEmail
>

export type EducationUpdateType = Static<typeof EducationUpdate>
export type WorkUpdateType = Static<typeof WorkUpdate>