import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import {
  CnaReadParamType,
  CSVImportErrorsType,
  CSVImportTimeEntryType,
  deleteTimeEntryWithUserType,
  TimeEntriesForCnaType,
  TimeEntryReadParamWithCompanyAndCrewType,
  TimeEntryReadParamWithUserType,
  TimeEntryReportType,
  TimeEntryRowType,
  TimeEntryRowWithProjectEntityType,
} from '../model/timeEntry.model'
import { TimeEntryRepositoryInterface } from '../repository/TimeEntryRepositoryInterface'
import { TaskNotExistsError } from '@src/core/customExceptions/TaskNotExistsError'
import { ProjectType } from '@src/core/Report/model/productivity.model'
import { UserProfileRepositoryInterface } from '@src/core/User/repository/UserProfileRepositoryInterface'
import { TimeEntryError } from '@src/core/customExceptions/TimeEntryError'
import { CompleteUserProfileType } from '@src/core/User/model/user.model'
import { parseString, writeToString } from 'fast-csv'

export class TimeEntryService {
  constructor(
    private timeEntryRepository: TimeEntryRepositoryInterface,
    private taskRepository: TaskRepositoryInterface,
    private userProfileRepository: UserProfileRepositoryInterface,
  ) {}

  async find(
    params: TimeEntryReadParamWithUserType,
  ): Promise<TimeEntryRowWithProjectEntityType[]> {
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
                start: entry.timeEntryDate.substring(0, 10),
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
              return {
                date: entry.date,
                email: user?.uid ?? '',
                name: user?.name ?? '',
                company: user?.company ?? '',
                crew: user?.crew ?? '',
                customer: entry.customer,
                project: entry.project.name,
                task: entry.task,
                projectType: entry.project.type,
                plannedHours: entry.project.plannedHours,
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

  async save(params: TimeEntryRowType): Promise<void> {
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
        index: params.index,
      })
    }

    await this.timeEntryRepository.save(params)
  }

  async csvImport(
    params: CSVImportTimeEntryType,
  ): Promise<CSVImportErrorsType> {
    interface CsvRow {
      customer: string
      project: string
      task: string
      user: string
      date: string
      hours: string
      timeStart: string
      timeEnd: string
      description: string
    }

    const errors: string[] = []
    const stream = parseString(params.data, {
      objectMode: true,
      delimiter: ';',
      headers: [
        'customer',
        'project',
        'task',
        'user',
        'date',
        'hours',
        'timeStart',
        'timeEnd',
        'description',
      ],
      renameHeaders: true,
      ignoreEmpty: true,
      trim: true,
    }).map((row: CsvRow) => ({
      task: row.task,
      project: row.project,
      customer: row.customer,
      company: params.company,
      user: row.user,
      date: row.date,
      hours: parseFloat(row.hours),
      startHour: row.timeStart,
      endHour: row.timeEnd,
      description: row.description,
    }))
    let index = 0
    for await (const row of stream) {
      index++
      const matchedEntries = (
        await this.find({
          from: row.date,
          to: row.date,
          user: row.user,
        })
      ).filter(
        (entry) =>
          entry.task == row.task &&
          entry.project.name == row.project &&
          entry.customer == row.customer,
      )

      if (matchedEntries.length > 0) {
        if (matchedEntries.length == 1) {
          if (matchedEntries[0].hours == row.hours) {
            errors.push(`Line ${index}: Time entry already exists`)
            continue
          }
          row.index = matchedEntries[0].index
        } else {
          errors.push(`Line ${index}: Time entry already exists multiple times`)
          continue
        }
      }

      try {
        await this.save(row)
      } catch (error) {
        let errorMessage = ''
        if (
          error instanceof TaskNotExistsError ||
          error instanceof TimeEntryError
        ) {
          errorMessage = error.message
        }
        errors.push(`Line ${index}: ${errorMessage}`)
      }
    }
    return { errors: errors }
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
      'date,email,name,company,crew,customer,project,task,projectType,plannedHours,hours,description,startHour,endHour'
    const csv = await writeToString(data, {
      headers: csvHeaders.split(','),
      alwaysWriteHeaders: true,
    })

    const customHeaders =
      'DATE,EMAIL,NAME,COMPANY,CREW,CUSTOMER,PROJECT,TASK,PROJECT TYPE,PLANNED HOURS,HOURS,DESCRIPTION,START HOUR,END HOUR'
    return csv.replace(csvHeaders, customHeaders)
  }
}
