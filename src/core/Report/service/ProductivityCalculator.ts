import { TimeEntryRowType } from '@src/core/TimeEntry/model/timeEntry.model'
import { ProjectType } from '@src/core/Report/model/productivity.model'

export class ProductivityCalculator {
  public calculate(
    userTimeEntries: TimeEntryRowType[],
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

    userTimeEntries.map((timeEntry) => {
      const projectType = projectTypes.find(
        (projectType) => projectType.project === timeEntry.project,
      )?.projectType

      switch (projectType) {
        case ProjectType.ABSENCE:
          absenceHours += timeEntry.hours
          break
        case ProjectType.BILLABLE:
          billableProductivityHours += timeEntry.hours
          break
        case ProjectType.NON_BILLABLE:
          nonBillableProductivityHours += timeEntry.hours
          break
        case ProjectType.SLACK_TIME:
          slackTimeHours += timeEntry.hours
          break
        default:
          slackTimeHours += timeEntry.hours
          break
      }
      workedHours += timeEntry.hours
    })

    const totalHoursInAWorkingDay = 8
    const totalWorkingHoursInPeriod =
      totalWorkingDaysInPeriod * totalHoursInAWorkingDay
    const totalHours = 100 / totalWorkingHoursInPeriod
    const missingHours = totalWorkingHoursInPeriod - workedHours

    const billableProductivityPercentage =
      totalHours * billableProductivityHours
    const nonBillableProductivityPercentage =
      totalHours * nonBillableProductivityHours
    const slackTimePercentage = totalHours * slackTimeHours
    const absencePercentage = totalHours * absenceHours
    const missingHoursPercentage = totalHours * missingHours

    const roundedTotal =
      Math.floor(billableProductivityPercentage) +
      Math.floor(nonBillableProductivityPercentage) +
      Math.floor(slackTimePercentage) +
      Math.floor(absencePercentage) +
      Math.floor(missingHoursPercentage)

    const percentages = {
      billable: billableProductivityPercentage,
      nonBillable: nonBillableProductivityPercentage,
      slack: slackTimePercentage,
      absence: absencePercentage,
      missing: missingHoursPercentage,
    }

    let roundedBillablePercentage = Math.floor(billableProductivityPercentage)
    let roundedNonBillablePercentage = Math.floor(
      nonBillableProductivityPercentage,
    )
    let roundedSlackPercentage = Math.floor(slackTimePercentage)
    let roundedAbsencePercentage = Math.floor(absencePercentage)

    if (roundedTotal > 100) {
      throw Error('More than 8 hours per day insert')
    }

    const percentageGap = 100 - roundedTotal
    let decimals = this.calculateDecimalParts(percentages)

    for (let i = 0; i < percentageGap; i++) {
      const max = this.calculateMaxDecimal(decimals)
      switch (max.name) {
        case 'billableDecimal':
          roundedBillablePercentage += 1
          break
        case 'nonBillableDecimal':
          roundedNonBillablePercentage += 1
          break
        case 'slackDecimal':
          roundedSlackPercentage += 1
          break
        case 'absenceDecimal':
          roundedAbsencePercentage += 1
          break
        default:
          break
      }

      decimals = decimals.filter((item) => item.name !== max.name)
    }

    return {
      workedHours,
      billableProductivityPercentage: roundedBillablePercentage,
      nonBillableProductivityPercentage: roundedNonBillablePercentage,
      slackTimePercentage: roundedSlackPercentage,
      absencePercentage: roundedAbsencePercentage,
      totalProductivityPercentage:
        roundedBillablePercentage + roundedNonBillablePercentage,
    }
  }

  private calculateDecimalParts(percentages: {
    billable: number
    nonBillable: number
    slack: number
    absence: number
    missing: number
  }) {
    return [
      {
        name: 'billableDecimal',
        value: percentages.billable - Math.floor(percentages.billable),
      },
      {
        name: 'nonBillableDecimal',
        value: percentages.nonBillable - Math.floor(percentages.nonBillable),
      },
      {
        name: 'slackDecimal',
        value: percentages.slack - Math.floor(percentages.slack),
      },
      {
        name: 'absenceDecimal',
        value: percentages.absence - Math.floor(percentages.absence),
      },
      {
        name: 'missingDecimal',
        value: percentages.missing - Math.floor(percentages.missing),
      },
    ]
  }

  private calculateMaxDecimal(decimals: { name: string; value: number }[]) {
    return decimals.reduce(
      (max, current) => (current.value > max.value ? current : max),
      decimals[0],
    )
  }
}
