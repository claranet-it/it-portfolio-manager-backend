
import { NetworkingSkillsRepositoryInterface } from '@src/core/Networking/repository/NetworkingSkillsRepositoryInterface'
import {NetworkingSkillsResponseType} from "@src/core/Networking/model/networking.model";

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
