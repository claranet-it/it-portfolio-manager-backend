import { Static, Type } from '@sinclair/typebox'

export const CompanyConnectionsDeleteBody = Type.Object({
  requesterId: Type.String(),
  correspondentId: Type.String(),
})

export type CompanyConnectionsDeleteBodyType = Static<
  typeof CompanyConnectionsDeleteBody
>
