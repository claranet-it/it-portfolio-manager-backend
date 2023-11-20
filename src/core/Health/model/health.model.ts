import { Static, Type } from '@sinclair/typebox'

export const HealthResponse = Type.Object({
  status: Type.String(),
})

export type HealthResponseType = Static<typeof HealthResponse>
