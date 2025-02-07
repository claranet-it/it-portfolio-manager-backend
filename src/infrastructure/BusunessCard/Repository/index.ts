import { PrismaClient } from '../../../../prisma/generated'
import { BusinessCardRepositoryInterface } from '@src/core/BusinessCard/repository'
import {
  BusinessCardType,
  DeleteBusinessCardType,
  GetBusinessCardType,
} from '@src/core/BusinessCard/model'

export class BusinessCardRepository implements BusinessCardRepositoryInterface {
  async save(params: BusinessCardType): Promise<void> {
    const prisma = new PrismaClient()

    await prisma.businessCard.upsert({
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
    const prisma = new PrismaClient()

    await prisma.businessCard.delete({
      where: {
        email: params.email,
      },
    })
  }

  async get(params: GetBusinessCardType): Promise<BusinessCardType | null> {
    const prisma = new PrismaClient()

    const businessCard = await prisma.businessCard.findUnique({
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
