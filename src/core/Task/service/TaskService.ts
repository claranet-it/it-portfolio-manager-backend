import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import {
  CustomerProjectDeleteParamsType,
  CustomerProjectUpdateParamsType,
  CustomerReadParamsType, CustomerType,
  ProjectListType,
  ProjectReadParamsType,
  TaskCreateReadParamsType,
  TaskListType,
  TaskPropertiesUpdateParamsType,
  TaskReadParamsType,
  TaskStructureType,
  TaskUpdateParamsType,
} from '../model/task.model'
import { TaskPropertiesRepositoryInterface } from '@src/core/Task/repository/TaskPropertiesRepositoryInterface'
import { TaskNotExistsError } from '@src/core/customExceptions/TaskNotExistsError'

export class TaskService {
  constructor(
    private taskRepository: TaskRepositoryInterface,
    private taskPropertiesRepository: TaskPropertiesRepositoryInterface,
  ) {}

  async getCustomers(params: CustomerReadParamsType): Promise<CustomerType[]> {
    return this.taskRepository.getCustomers(params)
  }

  async getProjects(params: ProjectReadParamsType): Promise<ProjectListType> {
    return this.taskRepository.getProjects(params)
  }

  async getTasks(params: TaskReadParamsType): Promise<TaskListType> {
    return this.taskRepository.getTasksWithProperties(params)
  }

  async getTaskStructure(company: string): Promise<TaskStructureType[]> {
    return this.taskRepository.getTaskStructure(company)
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
    const company = await this.taskRepository.getCompanyFromProject(params.project);

    if (company !== params.company || company === null) {
      throw new Error(`Cannot find project ${params.project}`)
    }

    return this.taskRepository.deleteCustomerProject(params)
  }
}
