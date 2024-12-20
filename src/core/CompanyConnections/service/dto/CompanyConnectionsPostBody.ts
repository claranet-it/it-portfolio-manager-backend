import { Static, Type } from '@sinclair/typebox'

export const CompanyConnectionsPostBody = Type.Object({
  requesterId: Type.String(),
  correspondentId: Type.String(),
})

export type CompanyConnectionsPostBodyType = Static<
  typeof CompanyConnectionsPostBody
>
