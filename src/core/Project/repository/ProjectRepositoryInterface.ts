import {
  ProjectReadParamsType,
  ProjectRowType,
} from '@src/core/Project/model/project'

export interface ProjectRepositoryInterface {
  get(params: ProjectReadParamsType): Promise<ProjectRowType[]>
  getByUid(uid: string): Promise<ProjectRowType | null>
}
