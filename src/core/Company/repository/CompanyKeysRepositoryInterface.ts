import { CompanyKeysType, CreateCompanyKeysType } from '@src/core/Company/model/CompanyKeys'
import { EncryptionStatus } from '../../../../prisma/generated'

export interface CompanyKeysRepositoryInterface {
  findByCompany(
    companyId: string,
  ): Promise<CompanyKeysType | null>

  save(companyKeys: CreateCompanyKeysType): Promise<void>

  updateEncryptionStatus(companyId: string, encryptionStatus: EncryptionStatus): Promise<void>
}
