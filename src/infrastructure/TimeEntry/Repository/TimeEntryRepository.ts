import {
  CnaReadParamType,
  deleteTimeEntryWithUserType,
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
import { PrismaClient } from '../../../../prisma/generated'
import { TaskError } from '@src/core/customExceptions/TaskError'

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

export class TimeEntryRepository implements TimeEntryRepositoryInterface {
  async find(
    params: TimeEntryReadParamWithUserType,
  ): Promise<TimeEntryRowWithProjectEntityType[]> {
    const prisma = new PrismaClient()
    const result = await prisma.timeEntry.findMany({
      where: {
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
      customer: timeEntry.task.project.customer.name,
      project: {
        name: timeEntry.task.project.name,
        type: timeEntry.task.project.project_type,
        plannedHours: timeEntry.task.project.plannedHours,
      },
      task: timeEntry.task.name,
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
    const prisma = new PrismaClient()

    const result = await prisma.timeEntry.findMany({
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
      customer: timeEntry.task.project.customer.name,
      project: {
        name: timeEntry.task.project.name,
        type: timeEntry.task.project.project_type,
        plannedHours: timeEntry.task.project.plannedHours,
      },
      task: timeEntry.task.name,
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
    const prisma = new PrismaClient()
    for (const user of flowingUsers) {
      const result = await prisma.timeEntry.findMany({
        where: {
          email: user,
          time_entry_date: {
            lte: new Date(to),
            gte: new Date(from),
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
          projectType: ProjectType.ABSENCE,
          task: timeEntry.task.name,
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
    const prisma = new PrismaClient()
    const result = await prisma.timeEntry.findMany({
      where: {
        task: {
          project: {
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
      projectType: ProjectType.ABSENCE,
      task: timeEntry.task.name,
      hours: timeEntry.hours,
      timeEntryDate: timeEntry.time_entry_date.toISOString(), // TODO: DUPLICATED
    }))
  }

  async save(params: TimeEntryRowType): Promise<void> {
    const prisma = new PrismaClient()

    if (params.index !== undefined) {
      await prisma.timeEntry.update({
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

    const task = await prisma.projectTask.findFirst({
      where: {
        name: params.task,
        project: {
          name: params.project,
          customer: {
            name: params.customer,
            company_id: params.company,
          },
        },
      },
    })

    if (!task) {
      throw new TaskError(`Cannot find task ${params.task}`)
    }

    await prisma.timeEntry.create({
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

    const prisma = new PrismaClient()
    await prisma.timeEntry.delete({
      where: {
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
}
