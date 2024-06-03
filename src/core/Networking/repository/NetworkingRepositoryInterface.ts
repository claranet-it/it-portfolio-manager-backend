import {NetworkingSkillsResponseType} from "@src/core/Networking/model/networking.model";

export interface NetworkingRepositoryInterface {
  getNetworkingAverageSkillsOf(company: string): Promise<NetworkingSkillsResponseType>
}
