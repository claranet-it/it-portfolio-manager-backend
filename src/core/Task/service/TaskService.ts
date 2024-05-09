import { ProjectRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import {
  ProjectReadParamsType,
  ProjectRowType,
} from '@src/core/Task/model/task.model'

export class ProjectService {
  constructor(private projectRepository: ProjectRepositoryInterface) {}

  async getByUid(uid: string): Promise<ProjectRowType | null> {
    return await this.projectRepository.getByUid(uid)
  }

  async get(params: ProjectReadParamsType): Promise<ProjectRowType[]> {
    return this.projectRepository.get(params)
  }
}
