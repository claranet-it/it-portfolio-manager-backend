import { Static, Type } from '@sinclair/typebox'
import { Education, ExperienceUpdate } from '@src/shared/experience.model'

export const EducationUpdate = ExperienceUpdate

export const EducationCreate = Education
export const EducationCreateWithUserEmail = Type.Intersect([
    EducationCreate,
    Type.Object({
        userEmail: Type.String(),
    }),
])

export type EducationUpdateType = Static<typeof EducationUpdate>
export type EducationCreateType = Static<typeof EducationCreate>
export type EducationCreateWithUserEmailType = Static<typeof EducationCreateWithUserEmail>