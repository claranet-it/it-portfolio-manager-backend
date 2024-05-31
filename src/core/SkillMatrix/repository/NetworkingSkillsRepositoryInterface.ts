import {NetworkingSkillsResponseType} from "@src/core/SkillMatrix/model/skillMatrix.model";

export interface NetworkingSkillsRepositoryInterface {
  getNetworkingAverageSkillsOf(company: string): Promise<NetworkingSkillsResponseType>
}
