import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import {
  CustomerProjectUpdateParamsType,
  ProjectReadParamsType,
  TaskCreateReadParamsType,
  TaskReadParamsType, TaskUpdateParamsType,
} from '../model/task.model'

export class TaskService {
  constructor(private taskRepository: TaskRepositoryInterface) {}

  async getCustomers(company: string): Promise<string[]> {
    return this.taskRepository.getCustomers(company)
  }

  async getProjects(params: ProjectReadParamsType): Promise<string[]> {
    return this.taskRepository.getProjects(params)
  }

  async getTasks(params: TaskReadParamsType): Promise<string[]> {
    return this.taskRepository.getTasks(params)
  }

  async createTask(params: TaskCreateReadParamsType): Promise<void> {
    return this.taskRepository.createTask(params)
  }

  async updateCustomerProject(params: CustomerProjectUpdateParamsType): Promise<void> {
    return this.taskRepository.updateCustomerProject(params)
  }
  async updateTask(params: TaskUpdateParamsType): Promise<void> {
    return this.taskRepository.updateTask(params)
  }
}
