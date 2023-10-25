import { Static, Type } from '@sinclair/typebox'

const ConfigurationSkills = Type.Object({
  Developer: Type.Array(Type.String()),
  Cloud: Type.Array(Type.String()),
})

const ScoreRangeLabels = Type.Object({
  0: Type.String(),
  1: Type.String(),
  2: Type.String(),
  3: Type.String(),
})

export const Configuration = Type.Object({
  crews: Type.Array(Type.String()),
  skills: ConfigurationSkills,
  scoreRange: Type.Object({
    min: Type.Number(),
    max: Type.Number(),
  }),
  scoreRangeLabels: ScoreRangeLabels,
})

export type ConfigurationType = Static<typeof Configuration>
