import {
  ProjectReadParamsType,
  ProjectRowType,
} from '@src/core/Task/model/task.model'

export interface ProjectRepositoryInterface {
  get(params: ProjectReadParamsType): Promise<ProjectRowType[]>
  getByUid(uid: string): Promise<ProjectRowType | null>
}
