import { CompanyRepositoryInterface } from '@src/core/Company/repository/CompanyRepositoryInterface'
import {
  CompanyFindType,
  CompanyType,
  CompanyWithSkillsType,
} from '@src/core/Company/model/Company'
import { PrismaClient } from '../../../../prisma/generated'

export class CompanyRepository implements CompanyRepositoryInterface {
  private prismaClient: PrismaClient

  constructor() {
    this.prismaClient = new PrismaClient()
  }

  async findById(
    id: string,
    joinSkills: boolean = false,
  ): Promise<CompanyType | CompanyWithSkillsType | null> {
    const company = await this.prismaClient.company.findFirst({
      where: { id: id },
      include: {
        ...(joinSkills && { skills: true }),
      },
    })

    if (!company) {
      return null
    }

    return {
      ...company,
      skills: company.skills?.map((skill) => ({
        id: skill.id,
        name: skill.name,
        serviceLine: skill.service_line,
        visible: skill.visible,
      })),
    }
  }

  async findOne(
    find: CompanyFindType,
    includeSkills: boolean = false,
  ): Promise<CompanyWithSkillsType | CompanyType | null> {
    let where = {}
    if (find.name) {
      where = { name: find.name }
    }
    if (find.domain) {
      where = { domain: find.domain }
    }
    const company = await this.prismaClient.company.findFirst({
      where: where,
      include: { skills: includeSkills },
    })

    if (!company) {
      return null
    }

    return {
      ...company,
      ...(includeSkills && {
        skills: company.skills.map((skill) => ({
          id: skill.id,
          name: skill.name,
          serviceLine: skill.service_line,
          visible: skill.visible,
        })),
      }),
    }
  }

  async findAll(idToExclude?: string): Promise<CompanyType[]> {
    let where = {}
    if (idToExclude) {
      where = {
        NOT: {
          id: idToExclude,
        },
      }
    }

    return this.prismaClient.company.findMany({
      where: where,
      orderBy: { name: 'asc' },
    })
  }

  async save(company: CompanyType): Promise<CompanyType> {
    return this.prismaClient.company.upsert({
      where: { id: company.id },
      update: company,
      create: company,
    })
  }
}
