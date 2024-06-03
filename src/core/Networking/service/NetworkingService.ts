import { NetworkingRepositoryInterface } from '@src/core/Networking/repository/NetworkingRepositoryInterface'
import {NetworkingEffortResponseType, NetworkingSkillsResponseType} from "@src/core/Networking/model/networking.model";

export class NetworkingService {
  constructor(
    private networkingRepository: NetworkingRepositoryInterface,
  ) {}

  async getNetworkingAverageSkillsOf(company: string): Promise<NetworkingSkillsResponseType> {
    return await this.networkingRepository.getNetworkingAverageSkillsOf(
      company,
    )
  }

  async getNetworkingAverageEffortOf(company: string): Promise<NetworkingEffortResponseType> {
    return await this.networkingRepository.getNetworkingAverageEffortOf(
        company,
    )
  }
}
