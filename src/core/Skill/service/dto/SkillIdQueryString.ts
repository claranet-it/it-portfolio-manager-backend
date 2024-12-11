import { Static, Type } from '@sinclair/typebox'

export const SkillIdQueryString = Type.Object({
  id: Type.Number(),
})

export type SkillIdQueryStringType = Static<typeof SkillIdQueryString>
