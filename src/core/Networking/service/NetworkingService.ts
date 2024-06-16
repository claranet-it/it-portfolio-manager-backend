import { NetworkingRepositoryInterface } from '@src/core/Networking/repository/NetworkingRepositoryInterface'
import {
  NetworkingCompanyEffortRowWithSkill,
  CompanySkillType,
  NetworkingEffortResponseType,
  NetworkingSkillsResponseType,
  SkillType,
} from '@src/core/Networking/model/networking.model'

export class NetworkingService {
  constructor(private networkingRepository: NetworkingRepositoryInterface) {}

  async getNetworkingAverageSkillsOf(
    company: string,
  ): Promise<NetworkingSkillsResponseType> {
    const skills =
      await this.networkingRepository.getNetworkingSkillsOf(company)
    const groupedSkills = skills.map((s) => this.groupBySkill(s))
    return await this.calculateAverageScore(groupedSkills)
  }

  async getNetworkingAverageEffortOf(
    company: string,
  ): Promise<NetworkingEffortResponseType> {
    const networkingSkills =
      await this.networkingRepository.getNetworkingSkillsOf(company)
    return await this.calculateAverageEffort(networkingSkills, company)
  }

  private groupBySkill(array: CompanySkillType[]) {
    const groupedSkills = this.groupByKey(array, (i) => i.skill)
    return Object.entries(groupedSkills).map(([skill, group]) => ({
      skill: skill,
      companySkill: group,
    }))
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

  private async calculateAverageEffort(
    networking: CompanySkillType[][],
    company: string,
  ): Promise<NetworkingEffortResponseType> {
    const efforts =
      await this.networkingRepository.getNetworkingEffortOf(company)
    const flatEfforts = efforts.flat(2)

    return networking
      .map((company) => {
        const effortsWithSkills = company.flatMap((companySkill) => {
          const uidEfforts = flatEfforts.filter(
            (companyEffort) => companyEffort.uid === companySkill.uid,
          )
          return uidEfforts.map((effort) => {
            return {
              company: effort.company,
              uid: effort.uid,
              month_year: effort.month_year,
              confirmedEffort: effort.confirmedEffort,
              tentativeEffort: effort.tentativeEffort,
              skill: companySkill.skill,
            }
          })
        })
        const effortsBySkill =
          this.groupEffortsBySkillAndPeriod(effortsWithSkills)
        return effortsBySkill.length > 0 ? { [ company[0].company ]: effortsBySkill } : null
      })
      .filter((n) => n !== null)
  }

  private groupEffortsBySkillAndPeriod(array: NetworkingCompanyEffortRowWithSkill[]) {
    const groupedSkills = this.groupByKey(array, (i) => i.skill)
    return Object.entries(groupedSkills).map(([skill, group]) => ({
      skill,
      effort: this.groupEffortsByPeriod(group),
    }))
  }

  private groupEffortsByPeriod(array: NetworkingCompanyEffortRowWithSkill[]) {
    const groupedPeriods = this.groupByKey(array, (i) => i.month_year)
    return Object.entries(groupedPeriods).map(([period, effort]) => ({
      month_year: period,
      people: effort.length,
      confirmedEffort: this.average(effort.map((e) => e.confirmedEffort)),
      tentativeEffort: this.average(effort.map((e) => e.tentativeEffort)),
      totalEffort: this.average(
        effort.map((e) => e.confirmedEffort + e.tentativeEffort),
      ),
    }))
  }

  private average(numbers: number[]) {
    let sum = 0
    for (const n of numbers) {
      sum = sum + n
    }
    return numbers.length > 0 ? sum / numbers.length : 0
  }

  private groupByKey<T>(arr: T[], key: (i: T) => string): Record<string, T[]> {
    return arr.reduce(
      (groups, item) => {
        (groups[key(item)] ||= []).push(item)
        return groups
      },
      {} as Record<string, T[]>,
    )
  }
}
