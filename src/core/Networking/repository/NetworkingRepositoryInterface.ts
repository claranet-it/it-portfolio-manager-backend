import {
  CompanySkillType,
  NetworkingEffortResponseType,
} from "@src/core/Networking/model/networking.model";

export interface NetworkingRepositoryInterface {
  getNetworkingAverageSkillsOf(company: string): Promise<CompanySkillType[][]>
  getNetworkingAverageEffortOf(company: string): Promise<NetworkingEffortResponseType>
}
