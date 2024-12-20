import { Static, Type } from '@sinclair/typebox'
import { Company } from '@src/core/Company/model/Company'

export const CompanyConnections = Type.Object({
  requester: Company,
  correspondent: Company,
})

export type CompanyConnectionsType = Static<typeof CompanyConnections>
