import { NetworkingSkillsResponseType } from '@src/core/SkillMatrix/model/skillMatrix.model'
import { NetworkingSkillsRepositoryInterface } from '@src/core/SkillMatrix/repository/NetworkingSkillsRepositoryInterface'

export class NetworkingSkillsService {
  constructor(
    private networkingSkillsRepository: NetworkingSkillsRepositoryInterface,
  ) {}

  async getNetworkingAverageSkillsOf(company: string): Promise<NetworkingSkillsResponseType> {
    return await this.networkingSkillsRepository.getNetworkingAverageSkillsOf(
      company,
    )
  }
}
