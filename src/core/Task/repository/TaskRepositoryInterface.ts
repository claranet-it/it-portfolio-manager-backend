import {
  CustomerUpdateParamsType,
  ProjectReadParamsType,
  TaskCreateReadParamsType,
  TaskReadParamsType,
} from '../model/task.model'

export interface TaskRepositoryInterface {
  getCustomers(company: string): Promise<string[]>
  getProjects(params: ProjectReadParamsType): Promise<string[]>
  getTasks(params: TaskReadParamsType): Promise<string[]>
  createTask(params: TaskCreateReadParamsType): Promise<void>
  updateCustomerProject(params: CustomerUpdateParamsType): void;
}
