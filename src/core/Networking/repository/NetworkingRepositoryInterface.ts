import {
  CompanyEffortRowType,
  CompanySkillType,
} from "@src/core/Networking/model/networking.model";

export interface NetworkingRepositoryInterface {
  getNetworkingSkillsOf(company: string): Promise<CompanySkillType[][]>
  getNetworkingSkillsUidsOf(company: string): Promise<{ company: string, uid: string, skill: string }[][]>
  getNetworkingEffortOf(uids: string[]): Promise<CompanyEffortRowType[][]>
}
