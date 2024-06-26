import {
  ProductivityReportReadParamWithCompanyType,
  ProductivityReportResponseType,
  ProjectType,
} from '@src/core/Report/model/productivity.model'
import { ReportRepositoryInterface } from '@src/core/Report/repository/ReportRepositoryInterface'
import { UserProfileRepository } from '@src/infrastructure/User/repository/UserProfileRepository'
import { DateRangeError } from '@src/core/customExceptions/DateRangeError'
import { UserProfileWithUidType } from '@src/core/User/model/user.model'

export class ReportService {
  constructor(
    private reportRepository: ReportRepositoryInterface,
    private userProfileRepository: UserProfileRepository,
  ) {}

  async getProductivityReport(
    params: ProductivityReportReadParamWithCompanyType,
  ): Promise<ProductivityReportResponseType> {
    if (new Date(params.from) > new Date(params.to)) {
      throw new DateRangeError(params.from, params.to)
    }

    const companyTasks =
      await this.reportRepository.getProductivityReport(params)
    const projectTypes = await this.reportRepository.getProjectTypes(
      params.company,
    )
    const allUsers = await this.userProfileRepository.getAllUserProfiles()
    const totalWorkingDaysInPeriod = this.countWeekdays(params.from, params.to)

    if (totalWorkingDaysInPeriod === 0) {
      return await this.emptyWorkedHoursFor(allUsers)
    }

    return await Promise.all(
      allUsers.map(async (user) => {
        const userTasks = companyTasks.filter((task) => task.user === user.uid)
        const userInfo =
          await this.userProfileRepository.getCompleteUserProfile(user.uid)

        let billableProductivityHours = 0
        let nonBillableProductivityHours = 0
        let slackTimeHours = 0
        let absenceHours = 0
        let workedHours = 0
        for (const task of userTasks) {
          const projectType =
            projectTypes.find(
              (projectType) => projectType.project === task.project,
            )?.projectType ?? ProjectType.slack_time

          switch (projectType) {
            case ProjectType.absence:
              absenceHours = absenceHours + task.hours
              break
            case ProjectType.billable:
              billableProductivityHours = billableProductivityHours + task.hours
              break
            case ProjectType.non_billable:
              nonBillableProductivityHours +=
                nonBillableProductivityHours + task.hours
              break
            case ProjectType.slack_time:
              slackTimeHours = slackTimeHours + task.hours
              break
            default:
              break
          }

          workedHours += task.hours
        }

        const totalWorkingHoursInPeriod = totalWorkingDaysInPeriod * 8
        const totalHours = 100 / totalWorkingHoursInPeriod

        const billableProductivityPercentage =
          totalHours * billableProductivityHours
        const nonBillableProductivityPercentage =
          totalHours * nonBillableProductivityHours
        const slackTimePercentage = totalHours * slackTimeHours
        const absencePercentage = totalHours * absenceHours
        const totalProductivityPercentage =
          Math.round(billableProductivityPercentage) +
          Math.round(nonBillableProductivityPercentage)

        const total =
          billableProductivityPercentage +
          nonBillableProductivityPercentage +
          slackTimePercentage +
          absencePercentage
        const roundedTotal =
          Math.round(billableProductivityPercentage) +
          Math.round(nonBillableProductivityPercentage) +
          Math.round(slackTimePercentage) +
          Math.round(absencePercentage)

        return {
          user: {
            email: userInfo?.uid ?? '',
            name: userInfo?.name ?? '',
            picture: userInfo?.picture ?? '',
          },
          workedHours,
          totalTracked: {
            billableProductivity: Math.round(billableProductivityPercentage),
            nonBillableProductivity: Math.round(
              nonBillableProductivityPercentage,
            ),
            slackTime:
              Math.round(slackTimePercentage) +
              Math.round(total - roundedTotal),
            absence: Math.round(absencePercentage),
          },
          totalProductivity: totalProductivityPercentage,
        }
      }),
    )
  }

  private async emptyWorkedHoursFor(allUsers: UserProfileWithUidType[]) {
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
