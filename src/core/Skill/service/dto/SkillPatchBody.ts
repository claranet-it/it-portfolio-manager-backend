import { Static, Type } from '@sinclair/typebox'

export const SkillPatchBody = Type.Object({
  visible: Type.Boolean(),
})

export type SkillPatchBodyType = Static<typeof SkillPatchBody>
