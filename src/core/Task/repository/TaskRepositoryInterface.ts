import { ProjectReadParamsType } from "../model/task.model"

export interface TaskRepositoryInterface {
  getCustomers(company: string): Promise<string[]>
  getProjects(params: ProjectReadParamsType): Promise<string[]>
  
}
