import { Static, Type } from '@sinclair/typebox'

export const Configuration = Type.Object({
  skills: Type.Array(Type.String()),
  scoreRange: Type.Object({
    min: Type.Number(),
    max: Type.Number(),
  }),
})

export type ConfigurationType = Static<typeof Configuration>
