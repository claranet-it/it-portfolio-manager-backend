import { CompanyKeysType } from '@src/core/Company/model/CompanyKeys'

export interface CompanyKeysRepositoryInterface {
  findByCompany(
    companyId: string,
  ): Promise<CompanyKeysType | null>
}
