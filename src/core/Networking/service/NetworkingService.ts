
import { NetworkingRepositoryInterface } from '@src/core/Networking/repository/NetworkingRepositoryInterface'
import {NetworkingSkillsResponseType} from "@src/core/Networking/model/networking.model";

export class NetworkingService {
  constructor(
    private networkingRepository: NetworkingRepositoryInterface,
  ) {}

  async getNetworkingAverageSkillsOf(company: string): Promise<NetworkingSkillsResponseType> {
    return await this.networkingRepository.getNetworkingAverageSkillsOf(
      company,
    )
  }
}
