import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import {
  TimeEntryReadParamWithUserType,
  TimeEntryRowType,
} from '../model/timeEntry.model'
import { TimeEntryRepositoryInterface } from '../repository/TimeEntryRepositoryIntereface'
import { TaskNotExistsError } from '@src/core/customExceptions/TaskNotExistsError'

export class TimeEntryService {
  constructor(
    private timeEntryRepostiroy: TimeEntryRepositoryInterface,
    private taskRepository: TaskRepositoryInterface,
  ) {}

  find(params: TimeEntryReadParamWithUserType): Promise<TimeEntryRowType[]> {
    return this.timeEntryRepostiroy.find(params)
  }
  async saveMine(params: TimeEntryRowType): Promise<void> {
    const tasks = await this.taskRepository.getTasks({
      company: 'it',
      customer: params.customer,
      project: params.project,
    })
    if (!tasks.includes(params.task)) {
      throw new TaskNotExistsError()
    }
    return this.timeEntryRepostiroy.saveMine(params)
  }
}
