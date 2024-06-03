import {NetworkingSkillsResponseType} from "@src/core/Networking/model/networking.model";


export interface NetworkingSkillsRepositoryInterface {
  getNetworkingAverageSkillsOf(company: string): Promise<NetworkingSkillsResponseType>
}
