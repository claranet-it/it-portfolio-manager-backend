import { ProjectRepositoryInterface } from '@src/core/Project/repository/ProjectRepositoryInterface'
import {
  ProjectReadParamsType,
  ProjectRowType,
} from '@src/core/Project/model/project'

export class ProjectService {
  constructor(private projectRepository: ProjectRepositoryInterface) {}

  async getByUid(uid: string): Promise<ProjectRowType | null> {
    return await this.projectRepository.getByUid(uid)
  }

  async get(params: ProjectReadParamsType): Promise<ProjectRowType[]> {
    return this.projectRepository.get(params)
  }
}
