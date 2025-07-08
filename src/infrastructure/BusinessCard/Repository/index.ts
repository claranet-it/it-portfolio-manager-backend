import { BusinessCardRepositoryInterface } from '@src/core/BusinessCard/repository'
import {
  BusinessCardType,
  DeleteBusinessCardType,
  GetBusinessCardType,
} from '@src/core/BusinessCard/model'
import { PrismaDBConnection } from '@src/infrastructure/db/PrismaDBConnection'

export class BusinessCardRepository implements BusinessCardRepositoryInterface {
  constructor(private readonly prismaDBConnection: PrismaDBConnection) {}

  async save(params: BusinessCardType): Promise<void> {
    await this.prismaDBConnection.getClient().businessCard.upsert({
      where: {
        email: params.email,
      },
      update: {
        name: params.name,
        role: params.role,
        mobile: params.mobile,
      },
      create: {
        name: params.name,
        email: params.email,
        role: params.role,
        mobile: params.mobile,
      },
    })
  }

  async delete(params: DeleteBusinessCardType): Promise<void> {
    await this.prismaDBConnection.getClient().businessCard.delete({
      where: {
        email: params.email,
      },
    })
  }

  async get(params: GetBusinessCardType): Promise<BusinessCardType | null> {
    const businessCard = await this.prismaDBConnection.getClient().businessCard.findUnique({
      where: {
        email: params.email,
      },
    })

    if (!businessCard) {
      return null
    }

    return {
      name: businessCard.name,
      email: businessCard.email,
      role: businessCard.role || undefined,
      mobile: businessCard.mobile || undefined,
    }
  }
}
