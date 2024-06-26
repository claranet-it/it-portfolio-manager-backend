import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import {
  TimeEntryReadParamWithUserType,
  TimeEntryRowType,
  deleteTimeEntryWithUserType, CnaReadParamType, TimeEntryRowWithProjectType,
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
    return await this.timeEntryRepository.find(params)
  }

  async findForCna(
      params: CnaReadParamType,
  ): Promise<TimeEntryRowWithProjectType[]> {
    return await this.timeEntryRepository.findForCna(params)
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
    return await this.timeEntryRepository.saveMine(params)
  }

  async delete(params: deleteTimeEntryWithUserType): Promise<void> {
    await this.timeEntryRepository.delete(params)
  }
}
