import { Static, Type } from '@sinclair/typebox'

const ConfigurationSkills = Type.Object({
  Developer: Type.Array(Type.String()),
  Cloud: Type.Array(Type.String())
})

export const Configuration = Type.Object({
  crews: Type.Array(Type.String()),
  skills: ConfigurationSkills,
  scoreRange: Type.Object({
    min: Type.Number(),
    max: Type.Number(),
  }),
})

export type ConfigurationType = Static<typeof Configuration>
