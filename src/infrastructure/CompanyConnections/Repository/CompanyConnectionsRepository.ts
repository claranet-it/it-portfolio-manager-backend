import { Prisma, PrismaClient } from '../../../../prisma/generated'
import { CompanyConnectionsRepositoryInterface } from '@src/core/CompanyConnections/repository/CompanyConnectionsRepositoryInterface'
import { CompanyConnectionsType } from '@src/core/CompanyConnections/model/CompanyConnections'

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
      where.requester_company_id = requesterId
    }

    return this.prismaClient.companyConnections.findMany({
      where: where,
      include: {
        requester: true,
        correspondent: true,
      },
    })
  }
}
