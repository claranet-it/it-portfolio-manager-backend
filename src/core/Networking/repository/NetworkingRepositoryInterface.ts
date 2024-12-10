import {
  CompanyEffortRowType,
  CompanySkillType,
} from '@src/core/Networking/model/networking.model'

export interface NetworkingRepositoryInterface {
  getNetworkingSkillsOf(company: string): Promise<CompanySkillType[]>
  getNetworkingEffortOf(company: string): Promise<CompanyEffortRowType[]>
}
