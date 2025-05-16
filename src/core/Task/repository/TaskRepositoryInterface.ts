import {
  CustomerProjectDeleteParamsType,
  CustomerProjectUpdateParamsType,
  ProjectListType,
  ProjectReadParamsType,
  TaskCreateReadParamsType,
  TaskReadParamsType,
  TaskUpdateParamsType,
  TaskType,
  TaskStructureListType,
  CustomerReadParamsType, CustomerType, ProjectToEncryptType,
} from '../model/task.model'

export interface TaskRepositoryInterface {
  getCustomers(params: CustomerReadParamsType): Promise<string[]>
  getProjects(params: ProjectReadParamsType): Promise<ProjectListType>
  getTasks(params: TaskReadParamsType): Promise<string[]>
  getTaskStructure(company: string): Promise<TaskStructureListType>
  getTasksWithProperties(params: TaskReadParamsType): Promise<TaskType[]>
  getTasksWithProjectDetails(
    params: TaskReadParamsType,
  ): Promise<{ tasks: string[]; projectType: string; plannedHours: number }>
  createTask(params: TaskCreateReadParamsType): Promise<void>
  updateCustomerProject(params: CustomerProjectUpdateParamsType): Promise<void>
  updateTask(params: TaskUpdateParamsType): Promise<void>
  deleteCustomerProject(params: CustomerProjectDeleteParamsType): Promise<void>

  getCustomersByCompany(companyName: string): Promise<CustomerType[]>
  getTasksByCompany(companyName: string): Promise<TaskType[]>
  getProjectsByCompany(companyName: string): Promise<ProjectToEncryptType[]>
}
