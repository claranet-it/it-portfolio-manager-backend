import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { ReportRepositoryInterface } from '@src/core/Report/repository/ReportRepositoryInterface'
import { ProductivityReportReadParamWithCompanyType } from '@src/core/Report/model/productivity.model'
import { TimeEntryRowType } from '@src/core/TimeEntry/model/timeEntry.model'
import { PrismaClient } from '../../../../prisma/generated'

export class ReportRepository implements ReportRepositoryInterface {
  constructor(private dynamoDBClient: DynamoDBClient) {}

  async getProductivityReport(
    params: ProductivityReportReadParamWithCompanyType,
    uids: { email: string }[],
  ): Promise<TimeEntryRowType[]> {
    const prisma = new PrismaClient()

    const where = {
      time_entry_date: {
        gte: new Date(params.from),
        lte: new Date(params.to),
      },
      task: {
        project: {
          customer: {
            company_id: params.company,
          },
        },
      },
    }
    if (params.customer) {
      Object.assign(where['task']['project']['customer'], {
        name: params.customer,
      })
    }
    if (params.project) {
      Object.assign(where['task']['project'], { name: params.project })
    }
    if (params.task) {
      Object.assign(where['task'], { name: params.task })
    }
    if (params.name) {
      Object.assign(where, { email: { in: uids.map((item) => item.email) } })
    }

    const result = await prisma.timeEntry.findMany({
      where: where,
      include: {
        task: {
          include: {
            project: {
              include: { customer: true },
            },
          },
        },
      },
    })

    return result.map((timeEntry) => ({
      user: timeEntry.email,
      date: timeEntry.time_entry_date.toDateString(),
      company: timeEntry.task.project.customer.company_id,
      customer: timeEntry.task.project.customer.name,
      project: timeEntry.task.project.name,
      task: timeEntry.task.name,
      hours: timeEntry.hours,
      description: timeEntry.description ?? '',
      startHour: timeEntry.time_start ?? '',
      endHour: timeEntry.time_end ?? '',
    }))
  }

  async getProjectTypes(
    company: string,
  ): Promise<{ project: string; projectType: string }[]> {
    const prisma = new PrismaClient()
    const result = await prisma.project.findMany({
      where: {
        customer: {
          company_id: company,
        },
      },
      select: {
        name: true,
        project_type: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    return result.map((project) => ({
      project: project.name,
      projectType: project.project_type,
    }))
  }
}
