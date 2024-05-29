import { Static, Type } from '@sinclair/typebox'

export const ConfigurationCrews = Type.Array(
  Type.Object({
    name: Type.String(),
    service_line: Type.String(),
  }),
)

export type ConfigurationCrewsType = Static<typeof ConfigurationCrews>

const ConfigurationSkills = Type.Record(
  Type.String(),
  Type.Array(Type.String()),
)

const ScoreRangeLabels = Type.Object({
  0: Type.String(),
  1: Type.String(),
  2: Type.String(),
  3: Type.String(),
})

export const Configuration = Type.Object({
  crews: ConfigurationCrews,
  skills: ConfigurationSkills,
  scoreRange: Type.Object({
    min: Type.Number(),
    max: Type.Number(),
  }),
  scoreRangeLabels: ScoreRangeLabels,
})

export type ConfigurationType = Static<typeof Configuration>
