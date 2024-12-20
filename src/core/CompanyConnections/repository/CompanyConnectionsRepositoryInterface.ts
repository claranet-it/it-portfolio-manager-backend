import { CompanyConnectionsType } from '@src/core/CompanyConnections/model/CompanyConnections'

export interface CompanyConnectionsRepositoryInterface {
  findAll(requesterId?: string): Promise<CompanyConnectionsType[]>
}
