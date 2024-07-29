import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import {
  TimeEntryReadParamWithUserType,
  TimeEntryRowType,
  deleteTimeEntryWithUserType,
  CnaReadParamType,
  TimeEntriesForCnaType,
  TimeEntryReadParamWithCompanyAndCrewType,
  TimeEntryReportType,
} from '../model/timeEntry.model'
import { TimeEntryRepositoryInterface } from '../repository/TimeEntryRepositoryInterface'
import { TaskNotExistsError } from '@src/core/customExceptions/TaskNotExistsError'
import { ProjectType } from '@src/core/Report/model/productivity.model'
import { UserProfileRepositoryInterface } from '@src/core/User/repository/UserProfileRepositoryInterface'
import { TimeEntryError } from '@src/core/customExceptions/TimeEntryError'
import { CompleteUserProfileType } from '@src/core/User/model/user.model'
import { writeToString } from 'fast-csv'

export class TimeEntryService {
  constructor(
    private timeEntryRepository: TimeEntryRepositoryInterface,
    private taskRepository: TaskRepositoryInterface,
    private userProfileRepository: UserProfileRepositoryInterface,
  ) {}

  async find(
    params: TimeEntryReadParamWithUserType,
  ): Promise<TimeEntryRowType[]> {
    return await this.timeEntryRepository.find(params)
  }

  async findTimeOffForCna(
    params: CnaReadParamType,
  ): Promise<TimeEntriesForCnaType[]> {
    let timeEntries
    let users: CompleteUserProfileType[]
    if (params.company === 'flowing') {
      timeEntries = await this.timeEntryRepository.findTimeOffForFlowing(params)
      users = await this.userProfileRepository.getFlowingUserProfiles()
    } else {
      timeEntries =
        await this.timeEntryRepository.findTimeOffForClaranet(params)
      users = await this.userProfileRepository.getClaranetUserProfiles()
    }

    return timeEntries.length > 0
      ? await Promise.all(
          timeEntries.map(async (entry) => {
            const user = users.find((user) => user.uid === entry.user)
            return {
              description: entry.task, //TODO
              user: {
                email: user?.uid ?? '',
                name: user?.name ?? '',
              },
              userId: user?.uid ?? '',
              billable: entry.projectType === ProjectType.BILLABLE,
              task: {
                name: entry.task,
              },
              project: {
                name: entry.project,
                billable: entry.projectType === ProjectType.BILLABLE,
                clientName: entry.project,
              },
              timeInterval: {
                start: entry.timeEntryDate,
                end: '',
                duration: entry.hours.toString(),
              },
            }
          }),
        )
      : []
  }

  async generateReport(
    params: TimeEntryReadParamWithCompanyAndCrewType,
  ): Promise<TimeEntryReportType[] | string> {
    const timeEntries =
      await this.timeEntryRepository.findTimeEntriesForReport(params)
    const users = await this.userProfileRepository.getByCompany(params.company)
    const filteredUsers = params.crew
      ? users.filter((profile) => profile.crew === params.crew)
      : users

    let reportData =
      timeEntries.length > 0
        ? await Promise.all(
            timeEntries.map(async (entry) => {
              const user = filteredUsers.find((user) => user.uid === entry.user)
              const tasks = await this.taskRepository.getTasksWithProjectType({
                company: params.company,
                project: entry.project,
                customer: entry.customer,
              })

              return {
                date: entry.date,
                email: user?.uid ?? '',
                name: user?.name ?? '',
                company: user?.company ?? '',
                crew: user?.crew ?? '',
                customer: entry.customer,
                project: entry.project,
                task: entry.task,
                projectType: tasks.projectType,
                hours: entry.hours,
                description: entry.description,
                startHour: entry.startHour,
                endHour: entry.endHour,
              }
            }),
          )
        : []

    if (params.crew) {
      reportData = reportData.filter((data) => data.crew === params.crew)
    }
    return params.format === 'json'
      ? reportData
      : this.generateCsvFrom(reportData)
  }

  async saveMine(params: TimeEntryRowType): Promise<void> {
    const tasks = await this.taskRepository.getTasks({
      company: params.company,
      customer: params.customer,
      project: params.project,
    })
    if (!tasks.includes(params.task)) {
      throw new TaskNotExistsError()
    }
    if (!this.isWeekDay(params.date) && params.project === 'Assenze') {
      throw new TimeEntryError('Cannot insert absence on Saturday or Sunday')
    }

    if (params.hours === 0) {
      return await this.delete({
        user: params.user,
        customer: params.customer,
        project: params.project,
        task: params.task,
        date: params.date,
      })
    }

    return await this.timeEntryRepository.saveMine(params)
  }

  async delete(params: deleteTimeEntryWithUserType): Promise<void> {
    await this.timeEntryRepository.delete(params)
  }

  private isWeekDay(date: string): boolean {
    const start = new Date(date)
    const dayOfWeek = start.getDay()
    return !(dayOfWeek === 0 || dayOfWeek === 6)
  }

  private async generateCsvFrom(data: TimeEntryReportType[]): Promise<string> {
    // use fixed headers instead of { headers: true } to be sure of the key order
    const csvHeaders =
      'date,email,name,company,crew,customer,project,task,projectType,hours,description,startHour,endHour'
    const csv = await writeToString(data, {
      headers: csvHeaders.split(','),
      alwaysWriteHeaders: true,
    })

    const customHeaders =
      'DATE,EMAIL,NAME,COMPANY,CREW,CUSTOMER,PROJECT,TASK,PROJECT TYPE,HOURS,DESCRIPTION,START HOUR,END HOUR'
    return csv.replace(csvHeaders, customHeaders)
  }
}
