import { Static, Type } from '@sinclair/typebox'

export enum Provider  {'Claranet', 'Google'}

export const verifyJwtParams = Type.Object({
  provider: Type.Union(Object.values(Provider).map((provider) => Type.Literal(provider))),
  token: Type.String(),
})

export type verifyJwtParamsType = Static<typeof verifyJwtParams>
