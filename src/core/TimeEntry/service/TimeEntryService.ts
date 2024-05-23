import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import {
  TimeEntryReadParamWithUserType,
  TimeEntryRowType,
  deleteTimeEntryWithUserType,
} from '../model/timeEntry.model'
import { TimeEntryRepositoryInterface } from '../repository/TimeEntryRepositoryIntereface'
import { TaskNotExistsError } from '@src/core/customExceptions/TaskNotExistsError'

export class TimeEntryService {
  constructor(
    private timeEntryRepository: TimeEntryRepositoryInterface,
    private taskRepository: TaskRepositoryInterface,
  ) {}

  async find(
    params: TimeEntryReadParamWithUserType,
  ): Promise<TimeEntryRowType[]> {
    return this.timeEntryRepository.find(params)
  }
  async saveMine(params: TimeEntryRowType, company: string): Promise<void> {
    const tasks = await this.taskRepository.getTasks({
      company: company,
      customer: params.customer,
      project: params.project,
    })
    if (!tasks.includes(params.task)) {
      throw new TaskNotExistsError()
    }
    return this.timeEntryRepository.saveMine(params)
  }

  async delete(params: deleteTimeEntryWithUserType): Promise<void> {
    await this.timeEntryRepository.delete(params)
  }
}
