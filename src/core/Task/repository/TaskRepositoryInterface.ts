import {
  ProjectReadParamsType,
  ProjectRowType,
} from '@src/core/Task/model/task.model'

export interface TaskRepositoryInterface {
  get(params: ProjectReadParamsType): Promise<ProjectRowType[]>
  getByUid(uid: string): Promise<ProjectRowType | null>
  getCustomers(company: string): Promise<string[]>
}
