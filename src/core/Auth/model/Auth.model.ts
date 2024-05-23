import { Static, Type } from '@sinclair/typebox'

export enum providers  {'Claranet', 'Google'}

export const verifyJwtParams = Type.Object({
  provider: Type.Union(Object.values(providers).map((provider) => Type.Literal(provider))),
  token: Type.String(),
})

export type verifyJwtParamsType = Static<typeof verifyJwtParams>
