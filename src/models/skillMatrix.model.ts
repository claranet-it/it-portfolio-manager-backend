import { Static, Type } from '@sinclair/typebox'

export const SkillMatrixRow = Type.Object({
  uid: Type.String(),
  company: Type.String(),
  crew: Type.String(),
  skill: Type.String(),
  score: Type.Number(),
  updatedAt: Type.String(),
})

export const SkillMatrix = Type.Array(SkillMatrixRow)

export type SkillMatrixType = Static<typeof SkillMatrix>

export const SkillMatrixQueryParams = Type.Object({
  uid: Type.Optional(Type.String()),
  company: Type.Optional(Type.String())
})

export type SkillMatrixQueryParamsType = Static<typeof SkillMatrixQueryParams>

export const SkillMatrixReadParams = Type.Object({
  company: Type.String()
})

export type SkillMatrixReadParamsType = Static<typeof SkillMatrixReadParams>

export const SkillMatrixUpdateParams = Type.Object({
  skill: Type.String(),
  score: Type.Number()
})

export type SkillMatrixUpdateParamsType = Static<typeof SkillMatrixUpdateParams>