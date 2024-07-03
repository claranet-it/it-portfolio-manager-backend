import {
  ProductivityReportReadParamWithCompanyType,
  ProductivityReportResponseType,
  ProjectType,
} from '@src/core/Report/model/productivity.model'
import { ReportRepositoryInterface } from '@src/core/Report/repository/ReportRepositoryInterface'
import { UserProfileRepositoryInterface } from '@src/core/User/repository/UserProfileRepositoryInterface'
import { DateRangeError } from '@src/core/customExceptions/DateRangeError'
import { UserProfileWithUidType } from '@src/core/User/model/user.model'
import { FieldsOrderError } from '@src/core/customExceptions/FieldsOrderError'
import { TimeEntryRowType } from '@src/core/TimeEntry/model/timeEntry.model'

export class ReportService {
  constructor(
    private reportRepository: ReportRepositoryInterface,
    private userProfileRepository: UserProfileRepositoryInterface,
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

    const companyTasks = await this.reportRepository.getProductivityReport(
      params,
      uids,
    )

    const projectTypes = await this.reportRepository.getProjectTypes(
      params.company,
    )

    let allUsersProfiles: UserProfileWithUidType[] =
      await this.userProfileRepository.getAllUserProfiles()

    const filter = params.customer || params.project || params.task || params.name;
    if (filter) {
      allUsersProfiles = allUsersProfiles.filter((profile) => {
        return companyTasks.some((task) => task.user == profile.uid)
      })
    }

    const totalWorkingDaysInPeriod = this.countWeekdays(params.from, params.to)

    if (totalWorkingDaysInPeriod === 0) {
      if(filter) {
        return []
      }
      return await this.emptyWorkedHoursFor(allUsersProfiles)
    }

    return await Promise.all(
      allUsersProfiles.map(async (user) => {
        const userTasks = companyTasks.filter((task) => task.user === user.uid)
        const userInfo =
          await this.userProfileRepository.getCompleteUserProfile(user.uid)
        const {
          workedHours,
          billableProductivityPercentage,
          nonBillableProductivityPercentage,
          slackTimePercentage,
          absencePercentage,
          totalProductivityPercentage,
          total,
          roundedTotal,
        } = this.calculatePercentage(
          userTasks,
          projectTypes,
          totalWorkingDaysInPeriod,
        )

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

  private calculatePercentage(
    userTasks: TimeEntryRowType[],
    projectTypes: {
      project: string
      projectType: string
    }[],
    totalWorkingDaysInPeriod: number,
  ) {
    let billableProductivityHours = 0
    let nonBillableProductivityHours = 0
    let slackTimeHours = 0
    let absenceHours = 0
    let workedHours = 0
    for (const task of userTasks) {
      const projectType =
        projectTypes.find((projectType) => projectType.project === task.project)
          ?.projectType ?? ProjectType.SLACK_TIME

      switch (projectType) {
        case ProjectType.ABSENCE:
          absenceHours = absenceHours + task.hours
          break
        case ProjectType.BILLABLE:
          billableProductivityHours = billableProductivityHours + task.hours
          break
        case ProjectType.NON_BILLABLE:
          nonBillableProductivityHours +=
            nonBillableProductivityHours + task.hours
          break
        case ProjectType.SLACK_TIME:
          slackTimeHours = slackTimeHours + task.hours
          break
        default:
          break
      }

      workedHours += task.hours
    }

    const totalHoursInAWorkingDay = 8
    const totalWorkingHoursInPeriod =
      totalWorkingDaysInPeriod * totalHoursInAWorkingDay
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
      workedHours,
      billableProductivityPercentage,
      nonBillableProductivityPercentage,
      slackTimePercentage,
      absencePercentage,
      totalProductivityPercentage,
      total,
      roundedTotal,
    }
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
