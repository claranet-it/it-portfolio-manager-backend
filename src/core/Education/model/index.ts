import { Static } from '@sinclair/typebox'
import { ExperienceUpdate } from '@src/shared/experience.model'

export const EducationUpdate = ExperienceUpdate

export type EducationUpdateType = Static<typeof EducationUpdate>