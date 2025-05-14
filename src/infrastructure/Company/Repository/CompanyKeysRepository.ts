import { CompanyRepositoryInterface } from '@src/core/Company/repository/CompanyRepositoryInterface'
import {
  CompanyFindType,
  CompanyType,
  CompanyWithSkillsType,
} from '@src/core/Company/model/Company'
import { Prisma, PrismaClient } from '../../../../prisma/generated'
import { CompanyKeysRepositoryInterface } from '@src/core/Company/repository/CompanyKeysRepositoryInterface'
import { CompanyKeysType, CreateCompanyKeysType } from '@src/core/Company/model/CompanyKeys'

export class CompanyKeysRepository implements CompanyKeysRepositoryInterface {
  private prismaClient: PrismaClient

  constructor() {
    this.prismaClient = new PrismaClient()
  }

  async findByCompany(companyId: string): Promise<CompanyKeysType | null> {
    const companyKeys = await this.prismaClient.companyKeys.findUnique({
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
    }
  }

  async save(companyKeys: CreateCompanyKeysType): Promise<void> {
    await this.prismaClient.companyKeys.create({
      data: {
        company_id: companyKeys.company_id,
        encryptedPrivateKey: companyKeys.encryptedPrivateKey,
        encryptedAESKey: companyKeys.encryptedAESKey,
        publicKey: companyKeys.publicKey,
      },
    })
  }
}
