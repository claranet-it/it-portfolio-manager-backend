import { Static, Type } from '@sinclair/typebox'
import { ExperienceUpdate } from '@src/shared/experience.model'

export const WorkUpdate = Type.Intersect([
    ExperienceUpdate, Type.Object({
        role: Type.Optional(Type.String()),
    })
])

export type WorkUpdateType = Static<typeof WorkUpdate>