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
} from '../model/task.model'

export interface TaskRepositoryInterface {
  getCustomers(company: string): Promise<string[]>
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
}
