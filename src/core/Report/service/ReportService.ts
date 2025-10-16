import {
  ProductivityReportReadParamWithCompanyType,
  ProductivityReportResponseType,
  ProductivityServicelineReportReadParamType,
  ServiceLineProductivityReportResponseType,
} from '@src/core/Report/model/productivity.model'
import { ReportRepositoryInterface } from '@src/core/Report/repository/ReportRepositoryInterface'
import { UserProfileRepositoryInterface } from '@src/core/User/repository/UserProfileRepositoryInterface'
import { DateRangeError } from '@src/core/customExceptions/DateRangeError'
import { CompleteUserProfileType } from '@src/core/User/model/user.model'
import { ProductivityCalculator } from '@src/core/Report/service/ProductivityCalculator'
import { CrewRepositoryInterface } from '@src/core/Configuration/repository/CrewRepositoryInterface'
import { Mailer } from '@src/infrastructure/mailer/Mailer'
import { TimeEntryRepositoryInterface } from '@src/core/TimeEntry/repository/TimeEntryRepositoryInterface'
import { ProjectOverSeventyType } from '@src/core/Report/model/projects.model'

export class ReportService {
  constructor(
    private reportRepository: ReportRepositoryInterface,
    private crewRepository: CrewRepositoryInterface,
    private userProfileRepository: UserProfileRepositoryInterface,
    private productivityCalculator: ProductivityCalculator,
    private timeEntryRepository: TimeEntryRepositoryInterface,
    private readonly mailer: Mailer
  ) {}

  async getProductivityReport(
    params: ProductivityReportReadParamWithCompanyType,
  ): Promise<ProductivityReportResponseType> {
    if (new Date(params.from) > new Date(params.to)) {
      throw new DateRangeError(params.from, params.to)
    }

    let uids: { email: string }[] = []
    if (params.name) {
      uids = await this.userProfileRepository.getByName(
        params.name,
        params.company,
      )
    }

    const companyTimeEntries =
      await this.reportRepository.getProductivityReport(params, uids)

    const projectTypes = await this.reportRepository.getProjectTypes(
      params.company,
    )

    const crews = await this.crewRepository.findByCompany(params.company)

    let allUsersProfiles: CompleteUserProfileType[] =
      await this.userProfileRepository.getByCompany(params.company)

    const filter =
      params.customer || params.project || params.task || params.name
    if (filter) {
      allUsersProfiles = allUsersProfiles.filter((profile) => {
        return companyTimeEntries.some((task) => task.user == profile.uid)
      })
    }

    const totalWorkingDaysInPeriod = this.countWeekdays(params.from, params.to)

    if (totalWorkingDaysInPeriod === 0) {
      if (filter) {
        return []
      }
      return await this.emptyWorkedHoursFor(allUsersProfiles, crews)
    }

    return await Promise.all(
      allUsersProfiles.map(async (user) => {
        const userTimeEntries = companyTimeEntries.filter(
          (task) => task.user === user.uid,
        )
        const {
          workedHours,
          billableProductivityPercentage,
          nonBillableProductivityPercentage,
          slackTimePercentage,
          absencePercentage,
          totalProductivityPercentage,
        } = this.productivityCalculator.calculate(
          userTimeEntries,
          projectTypes,
          totalWorkingDaysInPeriod,
        )

        return {
          user: {
            email: user?.uid ?? '',
            name: user?.name ?? '',
            picture: user?.picture ?? '',
            crew: user?.crew ?? '',
            serviceLine: this.getServiceLineFromCrew(crews, user?.crew ?? ''),
          },
          workedHours,
          totalTracked: {
            billable: billableProductivityPercentage,
            'non-billable': nonBillableProductivityPercentage,
            'slack-time': slackTimePercentage,
            absence: absencePercentage,
          },
          totalProductivity: totalProductivityPercentage,
        }
      }),
    )
  }

  async getServiceLineProductivityReport(
    company: string,
    params: ProductivityServicelineReportReadParamType,
  ): Promise<ServiceLineProductivityReportResponseType> {
    if (new Date(params.from) > new Date(params.to)) {
      throw new DateRangeError(params.from, params.to)
    }

    const companyTimeEntries =
      await this.reportRepository.getProductivityReport(
        { company: company, ...params },
        [],
      )
    const projectTypes = await this.reportRepository.getProjectTypes(company)
    const crews = await this.crewRepository.findByCompany(company)
    const serviceLines: string[] = []
    for (const crew of crews) {
      if (serviceLines.includes(crew.service_line)) {
        continue
      }
      serviceLines.push(crew.service_line)
    }
    crews.map((crew) => crew.service_line)
    const allUsersProfiles: CompleteUserProfileType[] =
      await this.userProfileRepository.getByCompany(company)

    const totalWorkingDaysInPeriod = this.countWeekdays(params.from, params.to)

    if (totalWorkingDaysInPeriod === 0) {
      return await Promise.all(
        serviceLines.map(async (serviceLine) => {
          return {
            serviceLine: serviceLine,
            workedHours: 0,
            totalTracked: {
              billable: 0,
              'non-billable': 0,
              'slack-time': 0,
              absence: 0,
            },
            totalProductivity: 0,
          }
        }),
      )
    }

    return await Promise.all(
      serviceLines.map(async (serviceLine) => {
        const serviceLineUsers = allUsersProfiles.filter(
          (u) => this.getServiceLineFromCrew(crews, u.crew) == serviceLine,
        )
        const serviceLineTimeEntries = companyTimeEntries.filter(
          (timeEntry) => {
            return serviceLineUsers.map((u) => u.uid).includes(timeEntry.user)
          },
        )
        const {
          workedHours,
          billableProductivityPercentage,
          nonBillableProductivityPercentage,
          slackTimePercentage,
          absencePercentage,
          totalProductivityPercentage,
        } = this.productivityCalculator.calculateByServiceLine(
          serviceLineTimeEntries,
          projectTypes,
        )

        return {
          serviceLine: serviceLine,
          workedHours,
          totalTracked: {
            billable: billableProductivityPercentage,
            'non-billable': nonBillableProductivityPercentage,
            'slack-time': slackTimePercentage,
            absence: absencePercentage,
          },
          totalProductivity: totalProductivityPercentage,
        }
      }),
    )
  }

  async sendReportProjectOverSeventy (companyName: string): Promise<ProjectOverSeventyType[]> {
    return await this.timeEntryRepository.getProjectOverSeventy(companyName);
  }

  private async emptyWorkedHoursFor(
    allUsers: CompleteUserProfileType[],
    crews: { name: string; service_line: string }[],
  ) {
    return await Promise.all(
      allUsers.map(async (user) => {
        const userInfo =
          await this.userProfileRepository.getCompleteUserProfile(user.uid)
        return {
          user: {
            email: userInfo?.uid ?? '',
            name: userInfo?.name ?? '',
            picture: userInfo?.picture ?? '',
            crew: userInfo?.crew ?? '',
            serviceLine: this.getServiceLineFromCrew(
              crews,
              userInfo?.crew ?? '',
            ),
          },
          workedHours: 0,
          totalTracked: {
            billable: 0,
            'non-billable': 0,
            'slack-time': 0,
            absence: 0,
          },
          totalProductivity: 0,
        }
      }),
    )
  }

  private countWeekdays(startDate: string, endDate: string): number {
    const start = new Date(startDate)
    const end = new Date(endDate)

    let weekdays = 0

    const current = new Date(start)

    while (current <= end) {
      const dayOfWeek = current.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // 0 = Sunday, 6 = Saturday
        weekdays++
      }
      current.setDate(current.getDate() + 1)
    }

    return weekdays
  }

  private getServiceLineFromCrew(
    crews: { name: string; service_line: string }[],
    crew: string,
  ): string {
    const result = crews.filter((item) => item.name == crew)
    if (result.length == 0) {
      return ''
    }

    return result[0].service_line
  }
}
