import { Static, Type } from '@sinclair/typebox'
import { ExperienceUpdate, Work } from '@src/shared/experience.model'

export const WorkUpdate = Type.Intersect([
    ExperienceUpdate, Type.Object({
        role: Type.Optional(Type.String()),
    })
])

export const WorkCreate = Work
export const WorkCreateWithUserEmail = Type.Intersect([
    WorkCreate,
    Type.Object({
        userEmail: Type.String(),
    }),
])

export type WorkUpdateType = Static<typeof WorkUpdate>
export type WorkCreateType = Static<typeof WorkCreate>
export type WorkCreateWithUserEmailType = Static<typeof WorkCreateWithUserEmail>