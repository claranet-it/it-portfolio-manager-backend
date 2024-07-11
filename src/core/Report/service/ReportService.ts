import {
  ProductivityReportReadParamWithCompanyType,
  ProductivityReportResponseType,
} from '@src/core/Report/model/productivity.model'
import { ReportRepositoryInterface } from '@src/core/Report/repository/ReportRepositoryInterface'
import { UserProfileRepositoryInterface } from '@src/core/User/repository/UserProfileRepositoryInterface'
import { DateRangeError } from '@src/core/customExceptions/DateRangeError'
import { CompleteUserProfileType } from '@src/core/User/model/user.model'
import { FieldsOrderError } from '@src/core/customExceptions/FieldsOrderError'
import { ProductivityCalculator } from '@src/core/Report/service/ProductivityCalculator'

export class ReportService {
  constructor(
    private reportRepository: ReportRepositoryInterface,
    private userProfileRepository: UserProfileRepositoryInterface,
    private productivityCalculator: ProductivityCalculator,
  ) {}

  async getProductivityReport(
    params: ProductivityReportReadParamWithCompanyType,
  ): Promise<ProductivityReportResponseType> {
    if (new Date(params.from) > new Date(params.to)) {
      throw new DateRangeError(params.from, params.to)
    }

    if (params.task && !(params.customer && params.project)) {
      throw new FieldsOrderError()
    }

    if (params.project && !params.customer) {
      throw new FieldsOrderError()
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
      return await this.emptyWorkedHoursFor(allUsersProfiles)
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
          },
          workedHours,
          totalTracked: {
            billableProductivity: billableProductivityPercentage,
            nonBillableProductivity: nonBillableProductivityPercentage,
            slackTime: slackTimePercentage,
            absence: absencePercentage,
          },
          totalProductivity: totalProductivityPercentage,
        }
      }),
    )
  }

  private async emptyWorkedHoursFor(allUsers: CompleteUserProfileType[]) {
    return await Promise.all(
      allUsers.map(async (user) => {
        const userInfo =
          await this.userProfileRepository.getCompleteUserProfile(user.uid)
        return {
          user: {
            email: userInfo?.uid ?? '',
            name: userInfo?.name ?? '',
            picture: userInfo?.picture ?? '',
          },
          workedHours: 0,
          totalTracked: {
            billableProductivity: 0,
            nonBillableProductivity: 0,
            slackTime: 0,
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
}
