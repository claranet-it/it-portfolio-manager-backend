import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import {
  CustomerProjectDeleteParamsType,
  CustomerProjectUpdateParamsType,
  ProjectListType,
  ProjectReadParamsType,
  TaskCreateReadParamsType,
  TaskListType,
  TaskPropertiesUpdateParamsType,
  TaskReadParamsType,
  TaskUpdateParamsType,
} from '../model/task.model'
import { TaskPropertiesRepositoryInterface } from '@src/core/Task/repository/TaskPropertiesRepositoryInterface'
import { TaskNotExistsError } from '@src/core/customExceptions/TaskNotExistsError'

export class TaskService {
  constructor(
    private taskRepository: TaskRepositoryInterface,
    private taskPropertiesRepository: TaskPropertiesRepositoryInterface,
  ) {}

  async getCustomers(company: string): Promise<string[]> {
    return this.taskRepository.getCustomers(company)
  }

  async getProjects(params: ProjectReadParamsType): Promise<ProjectListType> {
    return this.taskRepository.getProjects(params)
  }

  async getTasks(params: TaskReadParamsType): Promise<TaskListType> {
    return this.taskRepository.getTasksWithProperties(params)
  }

  async createTask(params: TaskCreateReadParamsType): Promise<void> {
    return this.taskRepository.createTask(params)
  }

  async updateCustomerProject(
    params: CustomerProjectUpdateParamsType,
  ): Promise<void> {
    return this.taskRepository.updateCustomerProject(params)
  }
  async updateTask(params: TaskUpdateParamsType): Promise<void> {
    return this.taskRepository.updateTask(params)
  }

  async updateTaskProperties(
    params: TaskPropertiesUpdateParamsType,
  ): Promise<void> {
    const tasks = await this.getTasks({
      customer: params.customer,
      project: params.project,
      company: params.company,
    })

    if (tasks.filter((task) => task.name === params.task).length === 0) {
      throw new TaskNotExistsError()
    }

    return this.taskPropertiesRepository.updateTaskProperties(params)
  }

  async deleteCustomerProject(
    params: CustomerProjectDeleteParamsType,
  ): Promise<void> {
    return this.taskRepository.deleteCustomerProject(params)
  }
}
