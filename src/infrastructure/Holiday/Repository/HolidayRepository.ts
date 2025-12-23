import { HolidayRepositoryInterface } from '@src/core/Holiday/repository/HolidayRepositoryInterface'
import {
  CompanyHolidayConfigType,
  SaveCompanyHolidayConfigType,
  SaveUserHolidayBaseType,
  UserHolidayBaseType,
} from '@src/core/Holiday/model/holiday.model'
import { PrismaDBConnection } from '@src/infrastructure/db/PrismaDBConnection'
import { ProjectType } from '@src/core/Report/model/productivity.model'
import { CompanyHolidayConfig, UserHolidayBase } from '../../../../prisma/generated'

// Task name for holidays (vacation days)
const HOLIDAY_TASK_NAME = 'FERIE'

export class HolidayRepository implements HolidayRepositoryInterface {
  constructor(private readonly prismaDBConnection: PrismaDBConnection) {}

  async getCompanyHolidayConfig(
    companyId: string,
  ): Promise<CompanyHolidayConfigType[]> {
    const configs = await this.prismaDBConnection
      .getClient()
      .companyHolidayConfig.findMany({
        where: { company_id: companyId },
        orderBy: { years_min: 'asc' },
      })

    return configs.map((config: CompanyHolidayConfig) => ({
      id: config.id,
      company_id: config.company_id,
      years_min: config.years_min,
      years_max: config.years_max,
      holiday_hours: config.holiday_hours,
    }))
  }

  async saveCompanyHolidayConfig(
    companyId: string,
    config: SaveCompanyHolidayConfigType,
  ): Promise<CompanyHolidayConfigType> {
    const result = await this.prismaDBConnection
      .getClient()
      .companyHolidayConfig.upsert({
        where: {
          company_id_years_min: {
            company_id: companyId,
            years_min: config.years_min,
          },
        },
        update: {
          years_max: config.years_max ?? null,
          holiday_hours: config.holiday_hours,
        },
        create: {
          company_id: companyId,
          years_min: config.years_min,
          years_max: config.years_max ?? null,
          holiday_hours: config.holiday_hours,
        },
      })

    return {
      id: result.id,
      company_id: result.company_id,
      years_min: result.years_min,
      years_max: result.years_max,
      holiday_hours: result.holiday_hours,
    }
  }

  async deleteCompanyHolidayConfig(
    companyId: string,
    id: string,
  ): Promise<void> {
    await this.prismaDBConnection.getClient().companyHolidayConfig.delete({
      where: { id, company_id: companyId },
    })
  }

  async getUserHolidayBase(
    email: string,
    companyId: string,
  ): Promise<UserHolidayBaseType | null> {
    const result = await this.prismaDBConnection
      .getClient()
      .userHolidayBase.findUnique({
        where: {
          email_company_id: {
            email,
            company_id: companyId,
          },
        },
      })

    if (!result) {
      return null
    }

    return this.mapUserHolidayBase(result)
  }

  async getAllUserHolidayBases(
    companyId: string,
  ): Promise<UserHolidayBaseType[]> {
    const results = await this.prismaDBConnection
      .getClient()
      .userHolidayBase.findMany({
        where: { company_id: companyId },
        orderBy: { email: 'asc' },
      })

    return results.map((result: UserHolidayBase) => this.mapUserHolidayBase(result))
  }

  async saveUserHolidayBase(
    companyId: string,
    data: SaveUserHolidayBaseType,
  ): Promise<UserHolidayBaseType> {
    const result = await this.prismaDBConnection
      .getClient()
      .userHolidayBase.upsert({
        where: {
          email_company_id: {
            email: data.email,
            company_id: companyId,
          },
        },
        update: {
          hiring_date: new Date(data.hiring_date),
          base_remaining_hours: data.base_remaining_hours ?? null,
          reference_month: data.reference_month ?? null,
          reference_year: data.reference_year ?? null,
        },
        create: {
          email: data.email,
          company_id: companyId,
          hiring_date: new Date(data.hiring_date),
          base_remaining_hours: data.base_remaining_hours ?? null,
          reference_month: data.reference_month ?? null,
          reference_year: data.reference_year ?? null,
        },
      })

    return this.mapUserHolidayBase(result)
  }

  async deleteUserHolidayBase(
    email: string,
    companyId: string,
  ): Promise<void> {
    await this.prismaDBConnection.getClient().userHolidayBase.delete({
      where: {
        email_company_id: {
          email,
          company_id: companyId,
        },
      },
    })
  }

  async getHolidayHours(
    email: string,
    companyId: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<number> {
    // Only count hours from tasks named "FERIE" within absence projects
    const result = await this.prismaDBConnection.getClient().timeEntry.aggregate({
      _sum: {
        hours: true,
      },
      where: {
        email,
        time_entry_date: {
          gte: fromDate,
          lte: toDate,
        },
        task: {
          name: HOLIDAY_TASK_NAME,
          project: {
            project_type: ProjectType.ABSENCE,
            customer: {
              company_id: companyId,
            },
          },
        },
      },
    })

    return result._sum.hours ?? 0
  }

  private mapUserHolidayBase(result: UserHolidayBase): UserHolidayBaseType {
    return {
      id: result.id,
      email: result.email,
      company_id: result.company_id,
      hiring_date: result.hiring_date.toISOString().substring(0, 10),
      base_remaining_hours: result.base_remaining_hours,
      reference_month: result.reference_month,
      reference_year: result.reference_year,
    }
  }
}

