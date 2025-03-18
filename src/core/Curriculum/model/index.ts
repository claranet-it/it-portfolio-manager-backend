import { Static, Type } from '@sinclair/typebox'
import { Education, Work } from '@src/shared/experience.model'

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

export type CurriculumType = Static<typeof Curriculum>
export type CurriculumWithUserEmailType = Static<
    typeof CurriculumWithUserEmail
>
export type GetCurriculumByEmailType = Static<typeof GetCurriculumByEmail>
export type CurriculumUpdateType = Static<typeof CurriculumUpdate>
export type CurriculumUpdateWithUserEmailType = Static<
    typeof CurriculumUpdateWithUserEmail
>