import { CompanyKeysRepositoryInterface } from '@src/core/Company/repository/CompanyKeysRepositoryInterface'
import { CompanyKeysType, CreateCompanyKeysType } from '@src/core/Company/model/CompanyKeys'
import { PrismaDBConnection } from '@src/infrastructure/db/PrismaDBConnection'

export class CompanyKeysRepository implements CompanyKeysRepositoryInterface {
  constructor(private readonly prismaDBConnection: PrismaDBConnection) {}

  async findByCompany(companyId: string): Promise<CompanyKeysType | null> {
    const companyKeys = await this.prismaDBConnection.getClient().companyKeys.findUnique({
      where: {
        company_id: companyId,
      },
    })

    if (!companyKeys) {
      return null;
    }

    return {
      encryptedPrivateKey: companyKeys.encryptedPrivateKey,
      encryptedAESKey: companyKeys.encryptedAESKey,
      publicKey: companyKeys.publicKey,
      encryptionCompleted: companyKeys.encryptionCompleted
    }
  }

  async save(companyKeys: CreateCompanyKeysType): Promise<void> {
    await this.prismaDBConnection.getClient().companyKeys.create({
      data: {
        company_id: companyKeys.company_id,
        encryptedPrivateKey: companyKeys.encryptedPrivateKey,
        encryptedAESKey: companyKeys.encryptedAESKey,
        publicKey: companyKeys.publicKey,
      },
    })
  }

  async updateEncryptionStatus(companyId: string, encryptionCompleted: boolean): Promise<void> {
    await this.prismaDBConnection.getClient().companyKeys.update({
      where: {
        company_id: companyId
      },
      data: {
        encryptionCompleted: encryptionCompleted
      }
    })
  }
}
