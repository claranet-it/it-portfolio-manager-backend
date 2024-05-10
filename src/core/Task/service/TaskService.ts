import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import {
  ProjectReadParamsType,
  ProjectRowType,
} from '@src/core/Task/model/task.model'

export class TaskService {
  constructor(private taskRepository: TaskRepositoryInterface) {}

  async getByUid(uid: string): Promise<ProjectRowType | null> {
    return await this.taskRepository.getByUid(uid)
  }

  async get(params: ProjectReadParamsType): Promise<ProjectRowType[]> {
    return this.taskRepository.get(params)
  }

  async getCustomers(company: string): Promise<string[]>{
    return this.taskRepository.getCustomers(company)
  }
}
