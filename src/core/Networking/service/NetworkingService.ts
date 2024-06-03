import {NetworkingRepositoryInterface} from '@src/core/Networking/repository/NetworkingRepositoryInterface'
import {
    CompanyEffortWithSkillRowType,
    CompanySkillType, CompanySkillWithUidType,
    NetworkingEffortResponseType,
    NetworkingSkillsResponseType, SkillType
} from "@src/core/Networking/model/networking.model";

export class NetworkingService {
    constructor(
        private networkingRepository: NetworkingRepositoryInterface,
    ) {
    }

    async getNetworkingAverageSkillsOf(company: string): Promise<NetworkingSkillsResponseType> {
        const skills = await this.networkingRepository.getNetworkingSkillsOf(
            company,
        )
        const groupedSkills = skills.map((s) => this.groupBySkill(s))
        return await this.calculateAverageScore(groupedSkills)
    }

    async getNetworkingAverageEffortOf(company: string): Promise<NetworkingEffortResponseType> {
        const networkingSkills = await this.networkingRepository.getNetworkingSkillsUidsOf(
            company,
        )
        return await this.calculateAverageEffort(networkingSkills);
    }

    private groupBySkill(array: CompanySkillType[]) {
        const groups: { skill: string; companySkill: CompanySkillType[] }[] = []
        array.forEach(function (groupBy: CompanySkillType) {
            const groupKey = groupBy.skill
            const group = groups.find((g) => g.skill == groupKey)
            if (!group) {
                groups.push({skill: groupKey, companySkill: [groupBy]})
            } else {
                group.companySkill.push(groupBy)
            }
        })
        return groups
    }

    private groupEffortsBySkillAndPeriod(array: CompanyEffortWithSkillRowType[]) {
        const groups: { skill: string; period: CompanyEffortWithSkillRowType[] }[] = []
        array.forEach(function (groupBy: CompanyEffortWithSkillRowType) {
            const groupKey = groupBy.skill
            const group = groups.find((g) => g.skill == groupKey)
            if (!group) {
                groups.push({ skill: groupKey, period: [groupBy] })
            } else {
                group.period.push(groupBy)
            }
        })
        return groups.map(g => {
            return { skill: g.skill, period: this.groupEffortsByPeriod(g.period) }
        })
    }

    private groupEffortsByPeriod(array: CompanyEffortWithSkillRowType[]) {
        const groups: { period: string; effort: CompanyEffortWithSkillRowType[] }[] = []
        array.forEach(function (groupBy: CompanyEffortWithSkillRowType) {
            const groupKey = groupBy.month_year
            const group = groups.find((g) => g.period == groupKey)
            if (!group) {
                groups.push({ period: groupKey, effort: [groupBy] })
            } else {
                group.effort.push(groupBy)
            }
        })
        return groups.map(g => {
            const period = g.period
            const effort = g.effort
            const people= effort.length

            const averageConfirmed = this.average(effort.map(e => e.confirmedEffort))
            const averageTentative = this.average(effort.map(e => e.tentativeEffort))
            const total = this.average(effort.map(e => e.confirmedEffort + e.tentativeEffort))
            return { month: period, people, averageConfirmed, averageTentative, averageTotal: total }
        })
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
            results.push({company, skills: averageSkills})
        }
        return results
    }


    private async calculateAverageEffort(networking: CompanySkillWithUidType[][]): Promise<NetworkingEffortResponseType> {
        console.log(JSON.stringify(networking, null, 2))

        const uids = Array.from(new Set(networking.flatMap(n => n.map(x => x.uid))))
        const efforts = await this.networkingRepository.getNetworkingEffortOf(uids)
        const flatEfforts = efforts.flat(2);
        const groupedEfforts = networking.map(company => {
            const effortsWithSkills = company.flatMap(c => {
                const uidEfforts = flatEfforts.filter(e => e.uid === c.uid)
                return uidEfforts.map(u => {
                    return {
                        company: u.company,
                        uid: u.uid,
                        month_year: u.month_year,
                        confirmedEffort: u.confirmedEffort,
                        tentativeEffort: u.tentativeEffort,
                        skill: c.skill,
                    }
                })
            })
            const effortsBySkill = this.groupEffortsBySkillAndPeriod(effortsWithSkills);
            return { company: company[0].company,  effort: effortsBySkill }
        })

        //const groupedEfforts = this.groupByCompany(efforts);
        console.log(JSON.stringify(groupedEfforts, null, 2))

        return [{company: '', effort: []}]
    }

    private average(numbers: number[]) {
        let sum = 0
        for (const n of numbers) {
            sum = sum + n
        }
        return numbers.length > 0 ? sum / numbers.length : 0
    }
}
