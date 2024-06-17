import { NetworkingRepositoryInterface } from '@src/core/Networking/repository/NetworkingRepositoryInterface'
import {
  NetworkingEffortResponseType,
  NetworkingSkillsResponseType,
} from '@src/core/Networking/model/networking.model'
import { EffortReadParamsType } from '@src/core/Effort/model/effort'
import { skillsList } from '@src/core/Configuration/service/ConfigurationService'

export class NetworkingService {
  constructor(private networkingRepository: NetworkingRepositoryInterface) {}

  async getNetworkingAverageSkillsOf(
    company: string,
  ): Promise<NetworkingSkillsResponseType> {
    const networkingCompanies =
      await this.networkingRepository.getNetworkingOf(company)

    return await Promise.all(
      networkingCompanies.map(async (company) => {
        const availableCompanyPeopleSkills =
          await this.networkingRepository.getNetworkingSkillsOf(company)

        const averageCompanySkills = skillsList.map((skill) => {
          const peopleSkill = availableCompanyPeopleSkills.filter(
            (peopleSkill) => peopleSkill.skill === skill,
          )
          const peopleCount = peopleSkill.length
          const peopleScores = peopleSkill.map(
            (personSkill) => personSkill.score,
          )

          if (peopleCount === 0) {
            return {
              [skill]: {
                averageScore: 0,
                people: 0,
              },
            }
          } else {
            return {
              [skill]: {
                averageScore: this.average(peopleScores),
                people: peopleCount,
              },
            }
          }
        })

        return {
          [company]: {
            company,
            skills: averageCompanySkills,
          },
        }
      }),
    )
  }

  async getNetworkingAverageEffortOf(
    params: EffortReadParamsType,
    company: string,
  ): Promise<NetworkingEffortResponseType> {
    const networkingCompanies =
      await this.networkingRepository.getNetworkingOf(company)

    const requestedPeriods: string[] = []
    for (let i = 0; i <= params.months; i++) {
      const date = new Date()
      date.setDate(1)
      date.setMonth(date.getMonth() + i)
      const month_year =
        ('0' + (date.getMonth() + 1)).slice(-2) +
        '_' +
        date.getFullYear().toString().slice(-2)

      requestedPeriods.push(month_year)
    }

    return Promise.all(
      networkingCompanies.map(async (company) => {
        const availableCompanyPeopleSkills =
          await this.networkingRepository.getNetworkingSkillsOf(company)
        const availableCompanyPeopleEfforts =
          await this.networkingRepository.getNetworkingEffortOf(company)

        const companySkillEfforts = skillsList.map((skill) => {
          const peopleSkill = availableCompanyPeopleSkills.filter(
            (peopleSkill) => peopleSkill.skill === skill,
          )
          const peopleUids = peopleSkill.map((personSkill) => personSkill.uid)
          const peopleEfforts = availableCompanyPeopleEfforts.filter(
            (personEffort) =>
              personEffort.uid in peopleUids &&
              personEffort.month_year in requestedPeriods,
          )

          const companyEfforts = requestedPeriods.map((requestedPeriod) => {
            const peoplePeriodEffort = peopleEfforts.filter(
              (personEffort) => personEffort.month_year === requestedPeriod,
            )

            const peopleCount = peoplePeriodEffort.length
            const peopleConfirmedEffort = peoplePeriodEffort.map(
              (personPeriodEffort) => personPeriodEffort.confirmedEffort,
            )
            const peopleTentativeEffort = peoplePeriodEffort.map(
              (personPeriodEffort) => personPeriodEffort.tentativeEffort,
            )

            const averageConfirmedEffort = this.average(peopleConfirmedEffort)
            const averageTentativeEffort = this.average(peopleTentativeEffort)
            const averageTotalEffort =
              averageConfirmedEffort + averageTentativeEffort

            return {
              month_year: requestedPeriod,
              people: peopleCount,
              confirmedEffort: averageConfirmedEffort,
              tentativeEffort: averageTentativeEffort,
              totalEffort: averageTotalEffort,
            }
          })
          return { skill, name: company, effort: companyEfforts }
        })

        return { [company]: companySkillEfforts }
      }),
    )
  }

  private average(numbers: number[]) {
    let sum = 0
    for (const n of numbers) {
      sum = sum + n
    }
    return numbers.length > 0 ? sum / numbers.length : 0
  }
}
