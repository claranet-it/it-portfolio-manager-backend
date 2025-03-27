import { Prisma, PrismaClient } from '../../../../prisma/generated'
import { CompanyConnectionsRepositoryInterface } from '@src/core/CompanyConnections/repository/CompanyConnectionsRepositoryInterface'
import { CompanyConnectionsType } from '@src/core/CompanyConnections/model/CompanyConnections'
import { UniqueConstraintViolationException } from '@src/shared/exceptions/UniqueConstraintViolationException'

export class CompanyConnectionsRepository
  implements CompanyConnectionsRepositoryInterface
{
  private prismaClient: PrismaClient

  constructor() {
    this.prismaClient = new PrismaClient()
  }

  async findAll(requesterId?: string): Promise<CompanyConnectionsType[]> {
    const where: Prisma.CompanyConnectionsWhereInput = {}

    if (requesterId) {
      where.OR = [{ requester_company_id: requesterId }, { correspondent_company_id: requesterId }]
    }

    return this.prismaClient.companyConnections.findMany({
      where: where,
      include: {
        requester: true,
        correspondent: true,
      },
    })
  }

  async create(requesterId: string, correspondentId: string): Promise<void> {
    try {
      await this.prismaClient.companyConnections.create({
        data: {
          requester_company_id: requesterId,
          correspondent_company_id: correspondentId,
        },
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new UniqueConstraintViolationException(
          'Connection already exists',
        )
      } else {
        throw error
      }
    }
  }

  async delete(requesterId: string, correspondentId: string): Promise<void> {
    await this.prismaClient.companyConnections.deleteMany({
      where: {
        requester_company_id: requesterId,
        correspondent_company_id: correspondentId,
      },
    })
  }
}
