import { Static, Type } from '@sinclair/typebox'

export const Configuration = Type.Object({
  crews: Type.Array(Type.String()),
  skills: Type.Array(Type.String()),
  scoreRange: Type.Object({
    min: Type.Number(),
    max: Type.Number(),
  }),
})

export type ConfigurationType = Static<typeof Configuration>
