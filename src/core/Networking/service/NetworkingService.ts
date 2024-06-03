import { NetworkingRepositoryInterface } from '@src/core/Networking/repository/NetworkingRepositoryInterface'
import {
  CompanySkillType,
  NetworkingEffortResponseType,
  NetworkingSkillsResponseType, SkillType
} from "@src/core/Networking/model/networking.model";

export class NetworkingService {
  constructor(
    private networkingRepository: NetworkingRepositoryInterface,
  ) {}

  async getNetworkingAverageSkillsOf(company: string): Promise<NetworkingSkillsResponseType> {
    const skills = await this.networkingRepository.getNetworkingAverageSkillsOf(
      company,
    )
    const groupedSkills = skills.map((s) => this.groupBySkill(s))
    return await this.calculateAverageScore(groupedSkills)
  }

  async getNetworkingAverageEffortOf(company: string): Promise<NetworkingEffortResponseType> {
    return await this.networkingRepository.getNetworkingAverageEffortOf(
        company,
    )
  }

  private groupBySkill(array: CompanySkillType[]) {
    const groups: { skill: string; companySkill: CompanySkillType[] }[] = []
    array.forEach(function (groupBy: CompanySkillType) {
      const groupKey = groupBy.skill
      const group = groups.find((g) => g.skill == groupKey)
      if (!group) {
        groups.push({ skill: groupKey, companySkill: [groupBy] })
      } else {
        group.companySkill.push(groupBy)
      }
    })
    return groups
  }

  private async calculateAverageScore(
      groupedSkills: { skill: string; companySkill: CompanySkillType[] }[][],
  ): Promise<NetworkingSkillsResponseType> {
    const results: NetworkingSkillsResponseType = []
    for (const companySkills of groupedSkills) {
      const company = companySkills[0].companySkill[0].company
      const averageSkills: SkillType[] = companySkills.map((c) => {
        const people = c.companySkill.length
        let sum = 0
        for (const skill of c.companySkill) {
          sum = sum + skill.score
        }
        return {
          skill: c.companySkill[0].skill,
          averageScore: people !== 0 ? Math.round(sum / people) : 0,
          people: people,
        }
      })
      results.push({ company, skills: averageSkills })
    }
    return results
  }
}
