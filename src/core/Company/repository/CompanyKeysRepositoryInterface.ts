import { CompanyKeysType, CreateCompanyKeysType } from '@src/core/Company/model/CompanyKeys'

export interface CompanyKeysRepositoryInterface {
  findByCompany(
    companyId: string,
  ): Promise<CompanyKeysType | null>

  save(companyKeys: CreateCompanyKeysType): Promise<void>

  updateEncryptionStatus(companyId: string, encryptionCompleted: boolean): Promise<void>
}
