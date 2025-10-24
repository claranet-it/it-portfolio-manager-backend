import {
  CustomerProjectDeleteParamsType,
  CustomerProjectUpdateParamsType,
  ProjectListType,
  ProjectReadParamsType,
  TaskCreateReadParamsType,
  TaskReadParamsType,
  TaskUpdateParamsType,
  CustomerReadParamsType, CustomerType, TaskStructureType, TaskListType, ProjectToEncryptType,
} from '../model/task.model'
import { ProjectWithPercentageListType } from '@src/core/Report/model/projects.model'

export interface TaskRepositoryInterface {
  getCustomers(params: CustomerReadParamsType): Promise<CustomerType[]>
  getProjects(params: ProjectReadParamsType): Promise<ProjectListType>
  getTask(task: string): Promise<string | null>
  getTaskStructure(company: string): Promise<TaskStructureType[]>
  getTasksWithProperties(params: TaskReadParamsType): Promise<TaskListType>
  getTasksWithProjectDetails(
    params: TaskReadParamsType,
  ): Promise<{ tasks: string[]; projectType: string; plannedHours: number }>
  createTask(params: TaskCreateReadParamsType): Promise<void>
  updateCustomerProject(params: CustomerProjectUpdateParamsType): Promise<void>
  updateTask(params: TaskUpdateParamsType): Promise<void>
  deleteCustomerProject(params: CustomerProjectDeleteParamsType): Promise<void>
  deleteTask(id: string): Promise<void>
  getCustomersByCompany(companyName: string): Promise<CustomerType[]>
  getTasksByCompany(companyName: string): Promise<TaskListType>
  getProjectsByCompany(companyName: string): Promise<ProjectToEncryptType[]>
  deleteCustomersAndRelatedDataByCompany(id: string): Promise<void>
  getProjectsWithPercentage(company: string): Promise<ProjectWithPercentageListType>
}
