import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import {
  TimeEntryReadParamWithUserType,
  TimeEntryRowType,
  deleteTimeEntryWithUserType,
  CnaReadParamType,
  TimeEntriesForCnaType,
} from '../model/timeEntry.model'
import { TimeEntryRepositoryInterface } from '../repository/TimeEntryRepositoryInterface'
import { TaskNotExistsError } from '@src/core/customExceptions/TaskNotExistsError'
import { ProjectType } from '@src/core/Report/model/productivity.model'
import { UserProfileRepositoryInterface } from '@src/core/User/repository/UserProfileRepositoryInterface'
import { TimeEntryError } from '@src/core/customExceptions/TimeEntryError'

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
    const timeEntries = await this.timeEntryRepository.findTimeOffForCna(params)
    const users = await this.userProfileRepository.getAllUserProfiles()
    return timeEntries.length > 0
      ? Promise.all(
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
      return
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
}
