import {
  CnaReadParamType,
  deleteTimeEntryWithUserType,
  TimeEntriesToEncryptType,
  TimeEntryReadParamWithCompanyAndCrewType,
  TimeEntryReadParamWithUserType,
  TimeEntryRowType,
  TimeEntryRowWithProjectEntityType,
  TimeEntryRowWithProjectType,
} from '@src/core/TimeEntry/model/timeEntry.model'
import { TimeEntryRepositoryInterface } from '@src/core/TimeEntry/repository/TimeEntryRepositoryInterface'
import { ProjectType } from '@src/core/Report/model/productivity.model'
import { invariant } from '@src/helpers/invariant'
import { flowingUsers } from '@src/core/Configuration/service/ConfigurationService'
import { ProjectOverSeventyType, ReportProjectsWithCompanyType } from '@src/core/Report/model/projects.model'
import { PrismaDBConnection } from '@src/infrastructure/db/PrismaDBConnection'

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

export class TimeEntryRepository implements TimeEntryRepositoryInterface {
  constructor(private readonly prismaDBConnection: PrismaDBConnection) {}

  async find(
    params: TimeEntryReadParamWithUserType,
  ): Promise<TimeEntryRowWithProjectEntityType[]> {
    const result = await this.prismaDBConnection.getClient().timeEntry.findMany({ where: {
        email: params.user,
        time_entry_date: {
          lte: new Date(params.to),
          gte: new Date(params.from),
        },
      },
      include: {
        task: {
          include: {
            project: {
              include: {
                customer: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return result.map((timeEntry) => ({
      // id: timeEntry.id,
      user: timeEntry.email,
      date: timeEntry.time_entry_date.toISOString().substring(0, 10),
      company: timeEntry.task.project.customer.company_id,
      customer: { id: timeEntry.task.project.customer.id, name: timeEntry.task.project.customer.name },
      project: {
        id: timeEntry.task.project.id,
        name: timeEntry.task.project.name,
        type: timeEntry.task.project.project_type,
        plannedHours: timeEntry.task.project.plannedHours,
        completed: timeEntry.task.project.completed,
      },
      task: { id: timeEntry.task.id, name: timeEntry.task.name},
      hours: timeEntry.hours,
      description: timeEntry.description ?? '',
      startHour: timeEntry.time_start ?? '',
      endHour: timeEntry.time_end ?? '',
      index: timeEntry.id, // TODO: Temporary, when FE is ok we'll switch to id
    }))
  }

  async findTimeEntriesForReport(
    params: TimeEntryReadParamWithCompanyAndCrewType,
  ): Promise<TimeEntryRowWithProjectEntityType[]> {
    const result = await this.prismaDBConnection.getClient().timeEntry.findMany({
      where: {
        time_entry_date: {
          lte: new Date(params.to),
          gte: new Date(params.from),
        },
        task: {
          project: {
            customer: {
              company_id: params.company,
            },
          },
        },
      },
      include: {
        task: {
          include: {
            project: {
              include: {
                customer: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          createdAt: 'asc',
        },
        {
          time_entry_date: 'asc',
        },
      ],
    })

    return result.map((timeEntry) => ({
      // id: timeEntry.id,
      user: timeEntry.email,
      date: timeEntry.time_entry_date.toISOString().substring(0, 10),
      company: timeEntry.task.project.customer.company_id,
      customer: { id: timeEntry.task.project.customer.id, name: timeEntry.task.project.customer.name },
      project: {
        id: timeEntry.task.project.id,
        name: timeEntry.task.project.name,
        type: timeEntry.task.project.project_type,
        plannedHours: timeEntry.task.project.plannedHours,
        completed: timeEntry.task.project.completed,
      },
      task: { id: timeEntry.task.id, name: timeEntry.task.name},
      hours: timeEntry.hours,
      description: timeEntry.description ?? '',
      startHour: timeEntry.time_start ?? '',
      endHour: timeEntry.time_end ?? '',
      index: timeEntry.id, // TODO: Temporary, when FE is ok we'll switch to id
    }))
  }

  async findTimeOffForFlowing(
    params: CnaReadParamType,
  ): Promise<TimeEntryRowWithProjectType[]> {
    const { from, to } = this.getPeriodFromMonthAndYear(
      params.month,
      params.year,
    )
    const users = []
    for (const user of flowingUsers) {const result = await this.prismaDBConnection.getClient().timeEntry.findMany({
        where: {
          email: user,
          time_entry_date: {
            lte: new Date(to),
            gte: new Date(from),
          },
          task: {
            project: {
              id: 'be474592-e958-4892-b3a4-c3d6ff43b700',
            },
          },
        },
        include: {
          task: {
            include: {
              project: {
                include: {
                  customer: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      })
      users.push(
        result.map((timeEntry) => ({
          user: timeEntry.email,
          date: timeEntry.time_entry_date.toDateString(),
          company: timeEntry.task.project.customer.company_id,
          customer: timeEntry.task.project.customer.name,
          project: timeEntry.task.project.name,
          projectId: timeEntry.task.project.id,
          projectType: ProjectType.ABSENCE,
          task: timeEntry.task.name,
          taskId: timeEntry.task.id,
          hours: timeEntry.hours,
          timeEntryDate: timeEntry.time_entry_date.toDateString(), // TODO: DUPLICATED
        })),
      )
    }
    return users.flat()
  }

  async findTimeOffForClaranet(
    params: CnaReadParamType,
  ): Promise<TimeEntryRowWithProjectType[]> {
    const { from, to } = this.getPeriodFromMonthAndYear(
      params.month,
      params.year,
    )
    const result = await this.prismaDBConnection.getClient().timeEntry.findMany({ where: {
        task: {
          project: {
            id: 'be474592-e958-4892-b3a4-c3d6ff43b700',
            customer: {
              company_id: params.company,
            },
          },
        },
        time_entry_date: {
          lte: new Date(to),
          gte: new Date(from),
        },
        email: { notIn: flowingUsers },
      },
      include: {
        task: {
          include: {
            project: {
              include: {
                customer: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
    return result.map((timeEntry) => ({
      user: timeEntry.email,
      date: timeEntry.time_entry_date.toISOString(),
      company: timeEntry.task.project.customer.company_id,
      customer: timeEntry.task.project.customer.name,
      project: timeEntry.task.project.name,
      projectId: timeEntry.task.project.id,
      projectType: ProjectType.ABSENCE,
      task: timeEntry.task.name,
      taskId: timeEntry.task.id,
      hours: timeEntry.hours,
      timeEntryDate: timeEntry.time_entry_date.toISOString(), // TODO: DUPLICATED
    }))
  }

  async save(params: TimeEntryRowType): Promise<void> {
    if (params.index !== undefined) {
      await this.prismaDBConnection.getClient().timeEntry.update({
        data: {
          hours: params.hours,
          description: params.description,
          time_start: params.startHour,
          time_end: params.endHour,
        },
        where: {
          id: params.index,
          email: params.user,
          time_entry_date: new Date(params.date),
        },
      })

      return
    }

    const task = await this.prismaDBConnection.getClient().projectTask.findUniqueOrThrow({
      where: {
        id: params.task,
      },
    })

    await this.prismaDBConnection.getClient().timeEntry.create({
      data: {
        time_entry_date: new Date(params.date),
        task_id: task.id,
        hours: params.hours,
        description: params.description,
        time_start: params.startHour,
        time_end: params.endHour,
        email: params.user,
      },
    })
  }

  // TODO: Need a big refactor for params because we now need only the ID
  async delete(params: deleteTimeEntryWithUserType): Promise<void> {
    if (!params.index) {
      return
    }

    await this.prismaDBConnection.getClient().timeEntry.delete({ where: {
        id: params.index,
      },
    })
  }

  private getPeriodFromMonthAndYear(month: number, year: number) {
    invariant(MONTHS.includes(month), 'Month is not valid')
    invariant(year > 0, 'Year is required')

    const firstDayOfMonth = new Date(year, month - 1, 1)
    const lastDayOfMonth = new Date(year, month, 0)

    const fromYear = firstDayOfMonth.getFullYear()
    const fromMonth = firstDayOfMonth.getMonth() + 1
    const fromDay = firstDayOfMonth.getDate()

    const toYear = lastDayOfMonth.getFullYear()
    const toMonth = lastDayOfMonth.getMonth() + 1
    const toDay = lastDayOfMonth.getDate()

    const from = `${fromYear}-${(fromMonth > 9 ? '' : '0') + fromMonth}-${(fromDay > 9 ? '' : '0') + fromDay}`
    const to = `${toYear}-${(toMonth > 9 ? '' : '0') + toMonth}-${(toDay > 9 ? '' : '0') + toDay}`
    return { from, to }
  }

  async getTimeEntriesFilterBy(
    params: ReportProjectsWithCompanyType,
  ): Promise<TimeEntryRowWithProjectEntityType[]> {
    const result = await this.prismaDBConnection.getClient().timeEntry.findMany({
      where: {
        time_entry_date: {
          lte: new Date(params.to),
          gte: new Date(params.from),
        },
        email: {
          in: params.user
        },
        task: {
          id: {
            in: params.task
          },
          project: {
            id: {
              in: params.project
            },
            customer: {
              id: {
                in: params.customer
              },
              company_id: params.company,
            },
          },
        },
      },
      include: {
        task: {
          include: {
            project: {
              include: {
                customer: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          createdAt: 'asc',
        },
        {
          time_entry_date: 'asc',
        },
      ],
    })

    return result.map((timeEntry) => ({
      id: timeEntry.id,
      user: timeEntry.email,
      date: timeEntry.time_entry_date.toISOString().substring(0, 10),
      company: timeEntry.task.project.customer.company_id,
      customer: { id: timeEntry.task.project.customer.id, name: timeEntry.task.project.customer.name },
      project: {
        id: timeEntry.task.project.id,
        name: timeEntry.task.project.name,
        type: timeEntry.task.project.project_type,
        plannedHours: timeEntry.task.project.plannedHours,
        completed: timeEntry.task.project.completed,
      },
      task: { name: timeEntry.task.name, id: timeEntry.task.id },
      hours: timeEntry.hours,
      description: timeEntry.description ?? '',
      startHour: timeEntry.time_start ?? '',
      endHour: timeEntry.time_end ?? '',
    }))
  }

  async getTimeEntriesByCompany(companyName: string): Promise<TimeEntriesToEncryptType[]> {
    const result = await this.prismaDBConnection.getClient().timeEntry.findMany({
      where: {
        task: {
          project: {
            customer: {
              company_id: companyName,
            },
          },
        },
      },
    });

    return result.map((timeEntry) => ({
      id: timeEntry.id,
      description: timeEntry.description ?? '',
    }));
  }

  async getProjectOverSeventy(companyName: string): Promise<ProjectOverSeventyType[]> {
    return await this.prismaDBConnection.getClient().$queryRaw<Array<ProjectOverSeventyType>>`
      SELECT 
        p.id as projectId,
        p.name as projectName,
        c.id as customerId,
        c.name as customerName,
        p.plannedHours as plannedHours,
        COALESCE(SUM(te.hours), 0) as totalHours,
        CASE 
          WHEN p.plannedHours > 0 THEN ROUND(((COALESCE(SUM(te.hours), 0) / p.plannedHours) * 100), 0)
          ELSE 0
        END as completionPercentage
      FROM Project p
      INNER JOIN Customer c ON p.customer_id = c.id
      LEFT JOIN ProjectTask pt ON pt.project_id = p.id
      LEFT JOIN TimeEntry te ON te.task_id = pt.id
      WHERE c.company_id = ${companyName}
        AND p.is_inactive = 0
        AND p.completed = 0
      GROUP BY p.id, p.name, c.id, c.name, p.plannedHours
      HAVING completionPercentage > 70
      ORDER BY completionPercentage DESC
    `;
  }
}
