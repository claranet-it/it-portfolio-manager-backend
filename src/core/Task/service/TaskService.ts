import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import {
  CustomerProjectDeleteParamsType,
  CustomerProjectUpdateParamsType,
  ProjectReadParamsType,
  TaskCreateReadParamsType,
  TaskReadParamsType,
  TaskUpdateParamsType,
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
    try{
      if(!params.projectType) {
        const existingTasksOnProject = await this.taskRepository.getTasksWithProjectType({
          customer: params.customer,
          project: params.project,
          company: params.company
        })
        if (existingTasksOnProject.tasks.length > 0) {
          params["projectType"] = existingTasksOnProject.projectType
        }
      }
    } catch(error) {
      console.log("QUII")
      console.log(error)
    }
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
  async deleteCustomerProject(
    params: CustomerProjectDeleteParamsType,
  ): Promise<void> {
    return this.taskRepository.deleteCustomerProject(params)
  }
}
