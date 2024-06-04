import {
  CompanyEffortRowType,
  CompanySkillType,
} from "@src/core/Networking/model/networking.model";

export interface NetworkingRepositoryInterface {
  getNetworkingSkillsOf(company: string): Promise<CompanySkillType[][]>
  getNetworkingEffortOf(uids: string[]): Promise<CompanyEffortRowType[][]>
}
