import { Static, Type } from '@sinclair/typebox'

export enum Provider {
  'Claranet',
  'Google',
  'Microsoft',
}

export const verifyJwtParams = Type.Object({
  provider: Type.Union(
    Object.values(Provider).map((provider) => Type.Literal(provider)),
  ),
  token: Type.String(),
})

export type verifyJwtParamsType = Static<typeof verifyJwtParams>

export const AuthInfo = Type.Object({
  email: Type.String(),
  name: Type.String(),
  picture: Type.String(),
  companyId: Type.String(),
})

export type AuthInfoType = Static<typeof AuthInfo>
