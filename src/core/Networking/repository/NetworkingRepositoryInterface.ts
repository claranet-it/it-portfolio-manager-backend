import {NetworkingEffortResponseType, NetworkingSkillsResponseType} from "@src/core/Networking/model/networking.model";

export interface NetworkingRepositoryInterface {
  getNetworkingAverageSkillsOf(company: string): Promise<NetworkingSkillsResponseType>
  getNetworkingAverageEffortOf(company: string): Promise<NetworkingEffortResponseType>
}
