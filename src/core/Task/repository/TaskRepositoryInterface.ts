import {
  ProjectReadParamsType,
  TaskCreateParamType,
  TaskReadParamType,
} from '../model/task.model'

export interface TaskRepositoryInterface {
  getCustomers(company: string): Promise<string[]>
  getProjects(params: ProjectReadParamsType): Promise<string[]>
  getTasks(params: TaskReadParamType): Promise<string[]>
  createTask(params: TaskCreateParamType): Promise<void>
}
