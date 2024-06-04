import {
  CompanyEffortRowType,
  CompanySkillType, CompanySkillWithUidType,
} from "@src/core/Networking/model/networking.model";

export interface NetworkingRepositoryInterface {
  getNetworkingSkillsOf(company: string): Promise<CompanySkillType[][]>
  getNetworkingSkillsWithUidsOf(company: string): Promise<CompanySkillWithUidType[][]>
  getNetworkingEffortOf(uids: string[]): Promise<CompanyEffortRowType[][]>
}
