import { CompanyRepositoryInterface } from '@src/core/Company/repository/CompanyRepositoryInterface'
import {
  CompanyFindType,
  CompanyType,
  CompanyWithConnectionStatusType,
  CompanyWithSkillsType,
  ConnectionStatusType,
} from '@src/core/Company/model/Company'
import { Prisma } from '../../../../prisma/generated'
import { PrismaDBConnection } from '@src/infrastructure/db/PrismaDBConnection'

export class CompanyRepository implements CompanyRepositoryInterface {
  constructor(private readonly prismaDBConnection: PrismaDBConnection) {}

  async findById(
    id: string,
    joinSkills: boolean = false,
  ): Promise<CompanyType | CompanyWithSkillsType | null> {
    const company = await this.prismaDBConnection
      .getClient()
      .company.findFirst({
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
    const company = await this.prismaDBConnection
      .getClient()
      .company.findFirst({
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

  async findCompanyMaster(): Promise<CompanyType | null> {
    const company = await this.prismaDBConnection
      .getClient()
      .company.findFirst({
        where: { company_master: true },
      })

    if (!company) {
      return null
    }

    return company
  }

  async findAll(
    idToExclude?: string,
    excludeConnectedCompanies?: boolean,
    excludeUnconnectedCompanies?: boolean,
  ): Promise<CompanyWithConnectionStatusType[]> {
    let where: Prisma.CompanyWhereInput = {}
    if (idToExclude) {
      where.NOT = { id: idToExclude }
    }
    if (excludeConnectedCompanies && idToExclude) {
      where.NOT = {
        OR: [
          { id: idToExclude },
          {
            requestedConnections: {
              some: { correspondent_company_id: idToExclude },
            },
          },
          {
            correspondentConnections: {
              some: { requester_company_id: idToExclude },
            },
          },
        ],
      }
    }

    if (excludeUnconnectedCompanies && idToExclude) {
      where = {
        OR: [
          {
            requestedConnections: {
              some: { correspondent_company_id: idToExclude },
            },
          },
          {
            correspondentConnections: {
              some: { requester_company_id: idToExclude },
            },
          },
        ],
      }
    }

    const companies = await this.prismaDBConnection
      .getClient()
      .company.findMany({
        where: where,
        orderBy: { name: 'asc' },
        include: {
          ...(idToExclude && {
            requestedConnections: {
              where: { correspondent_company_id: idToExclude },
            },
            correspondentConnections: {
              where: { requester_company_id: idToExclude },
            },
          }),
        },
      })

    return companies.map((company) => {
      const hasConnection =
        (company.requestedConnections?.length ?? 0) > 0 ||
        (company.correspondentConnections?.length ?? 0) > 0
      const connectionStatus: ConnectionStatusType = hasConnection
        ? 'CONNECTED'
        : 'UNCONNECTED'

      return {
        ...company,
        connectionStatus,
      }
    })
  }

  async save(company: CompanyType): Promise<CompanyType> {
    return this.prismaDBConnection.getClient().company.upsert({
      where: { id: company.id },
      update: company,
      create: company,
    })
  }

  async deleteCompany(idCompany: string): Promise<void> {
    const deleteSkill = this.prismaDBConnection.getClient().skill.deleteMany({
      where: {
        company_id: idCompany,
      },
    })

    const deleteCompany = this.prismaDBConnection.getClient().company.delete({
      where: {
        id: idCompany,
      },
    })

    await this.prismaDBConnection
      .getClient()
      .$transaction([deleteSkill, deleteCompany])
  }
}
