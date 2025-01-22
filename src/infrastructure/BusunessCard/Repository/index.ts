import { PrismaClient } from '../../../../prisma/generated'
import { BusinessCardRepositoryInterface } from '@src/core/BusinessCard/repository'
import { BusinessCardType } from '@src/core/BusinessCard/model'

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
    });
  }

}
