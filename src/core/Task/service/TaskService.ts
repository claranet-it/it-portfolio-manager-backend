import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import { ProjectReadParamsType, TaskReadParamType } from '../model/task.model'

export class TaskService {
  constructor(private taskRepository: TaskRepositoryInterface) {}


  async getCustomers(company: string): Promise<string[]>{
    return this.taskRepository.getCustomers(company)
  }

  async getProjects(params: ProjectReadParamsType): Promise<string[]>{
    return this.taskRepository.getProjects(params)
  }

  async getTasks(params: TaskReadParamType): Promise<string[]>{
    return this.taskRepository.getTasks(params)
  }
}
