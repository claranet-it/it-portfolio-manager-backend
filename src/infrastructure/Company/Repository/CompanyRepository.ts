import { CompanyRepositoryInterface } from '@src/core/Company/repository/CompanyRepositoryInterface'
import {
  CompanyFindType,
  CompanyType,
} from '@src/core/Company/model/Company'
import { PrismaClient } from '../../../../prisma/generated'

export class CompanyRepository implements CompanyRepositoryInterface {
  private prismaClient: PrismaClient

  constructor() {
    this.prismaClient = new PrismaClient()
  }

  async findById(id: string): Promise<CompanyType | null> {
    return this.prismaClient.company.findFirst({where: {id: id}})
  }

  async findOne(find: CompanyFindType): Promise<CompanyType | null> {
    let where = {}
    if (find.name) {
      where = {name: find.name}
    }
    return this.prismaClient.company.findFirst({where: where})
  }

  async findAll(): Promise<CompanyType[]> {
    return this.prismaClient.company.findMany({orderBy: {name: 'asc'}})
  }
}
