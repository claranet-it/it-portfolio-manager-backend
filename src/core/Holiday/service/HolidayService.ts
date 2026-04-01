import {
  CompanyHolidayConfigType,
  RemainingHolidaysResponseType,
  SaveCompanyHolidayConfigType,
  SaveUserHolidayBaseType,
  UserHolidayBaseType,
} from '../model/holiday.model'
import { HolidayRepositoryInterface } from '../repository/HolidayRepositoryInterface'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'

export class HolidayService {
  constructor(private holidayRepository: HolidayRepositoryInterface) {}

  async getCompanyHolidayConfig(
    companyId: string,
  ): Promise<CompanyHolidayConfigType[]> {
    return this.holidayRepository.getCompanyHolidayConfig(companyId)
  }

  async saveCompanyHolidayConfig(
    companyId: string,
    config: SaveCompanyHolidayConfigType,
  ): Promise<CompanyHolidayConfigType> {
    return this.holidayRepository.saveCompanyHolidayConfig(companyId, config)
  }

  async deleteCompanyHolidayConfig(
    companyId: string,
    id: string,
  ): Promise<void> {
    return this.holidayRepository.deleteCompanyHolidayConfig(companyId, id)
  }

  async getUserHolidayBase(
    email: string,
    companyId: string,
  ): Promise<UserHolidayBaseType | null> {
    return this.holidayRepository.getUserHolidayBase(email, companyId)
  }

  async getAllUserHolidayBases(
    companyId: string,
  ): Promise<UserHolidayBaseType[]> {
    return this.holidayRepository.getAllUserHolidayBases(companyId)
  }

  async saveUserHolidayBase(
    companyId: string,
    data: SaveUserHolidayBaseType,
  ): Promise<UserHolidayBaseType> {
    return this.holidayRepository.saveUserHolidayBase(companyId, data)
  }

  async deleteUserHolidayBase(
    email: string,
    companyId: string,
  ): Promise<void> {
    return this.holidayRepository.deleteUserHolidayBase(email, companyId)
  }

  async getRemainingHolidays(
    email: string,
    companyId: string,
    year?: number,
  ): Promise<RemainingHolidaysResponseType> {
    const currentDate = new Date()
    const currentYear = year ?? currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1 // 1-12

    // Get user's holiday base data
    const userHolidayBase = await this.holidayRepository.getUserHolidayBase(
      email,
      companyId,
    )

    if (!userHolidayBase) {
      throw new NotFoundException(
        `Holiday configuration not found for user ${email}`,
      )
    }

    const hiringDate = new Date(userHolidayBase.hiring_date)
    const yearsOfService = this.calculateYearsOfService(hiringDate, currentYear)

    // Get company holiday configuration
    const companyConfigs =
      await this.holidayRepository.getCompanyHolidayConfig(companyId)

    if (companyConfigs.length === 0) {
      throw new NotFoundException(
        `Holiday configuration not found for company ${companyId}`,
      )
    }

    // Find the applicable tier based on years of service
    const annualHolidayHours = this.getAnnualHolidayHours(
      companyConfigs,
      yearsOfService,
    )

    // Determine calculation method and period
    let calculationMethod: 'from_reference' | 'from_year_start'
    let usedHolidayHours: number
    let remainingHolidayHours: number

    if (
      userHolidayBase.base_remaining_hours !== null &&
      userHolidayBase.base_remaining_hours !== undefined &&
      userHolidayBase.reference_month !== null &&
      userHolidayBase.reference_month !== undefined &&
      userHolidayBase.reference_year !== null &&
      userHolidayBase.reference_year !== undefined
    ) {
      // Calculate from the reference point (carry-over scenario)
      calculationMethod = 'from_reference'
      const refYear = userHolidayBase.reference_year
      const refMonth = userHolidayBase.reference_month
      const fromDate = new Date(refYear, refMonth - 1, 1)

      // Get used hours since reference date
      const toDate = new Date(currentYear, 11, 31, 23, 59, 59)
      usedHolidayHours = await this.holidayRepository.getHolidayHours(
        email,
        companyId,
        fromDate,
        toDate,
      )

      // Calculate months elapsed since reference for prorated accrual
      const targetMonth = year === currentDate.getFullYear() ? currentMonth : 12
      const monthsElapsed = this.calculateMonthsElapsed(
        fromDate,
        new Date(currentYear, targetMonth - 1, 1),
      )
      const monthlyAccrual = annualHolidayHours / 12
      const accruedHours = monthsElapsed * monthlyAccrual

      remainingHolidayHours =
        userHolidayBase.base_remaining_hours + accruedHours - usedHolidayHours
    } else {
      // Calculate from the start of the year with prorating
      calculationMethod = 'from_year_start'
      const yearStart = new Date(currentYear, 0, 1)
      const toDate = new Date(currentYear, 11, 31, 23, 59, 59)

      usedHolidayHours = await this.holidayRepository.getHolidayHours(
        email,
        companyId,
        yearStart,
        toDate,
      )

      // Calculate prorated annual hours based on current month
      // If viewing a specific year in the past, use full year
      const targetMonth = year === currentDate.getFullYear() ? currentMonth : 12

      // Check if user was hired this year - prorate from hiring month
      const hiringYear = hiringDate.getFullYear()
      const hiringMonth = hiringDate.getMonth() + 1

      let proratedHours: number
      if (hiringYear === currentYear) {
        // First year - prorate from hiring month
        const monthsWorked = targetMonth - hiringMonth + 1
        proratedHours = (annualHolidayHours / 12) * Math.max(0, monthsWorked)
      } else {
        // Full year employee - prorate based on current month
        proratedHours = (annualHolidayHours / 12) * targetMonth
      }

      remainingHolidayHours = proratedHours - usedHolidayHours
    }

    return {
      email,
      company_id: companyId,
      hiring_date: userHolidayBase.hiring_date,
      years_of_service: yearsOfService,
      annual_holiday_hours: annualHolidayHours,
      used_holiday_hours: usedHolidayHours,
      remaining_holiday_hours: Math.round(remainingHolidayHours * 100) / 100,
      calculation_method: calculationMethod,
      reference_month: userHolidayBase.reference_month ?? null,
      reference_year: userHolidayBase.reference_year ?? null,
      year: currentYear,
    }
  }

  async getAllRemainingHolidays(
    companyId: string,
    year?: number,
  ): Promise<RemainingHolidaysResponseType[]> {
    const userBases = await this.holidayRepository.getAllUserHolidayBases(companyId)

    const results: RemainingHolidaysResponseType[] = []
    for (const userBase of userBases) {
      try {
        const remaining = await this.getRemainingHolidays(
          userBase.email,
          companyId,
          year,
        )
        results.push(remaining)
      } catch {
        // Skip users without valid configuration
      }
    }

    return results
  }

  private calculateYearsOfService(
    hiringDate: Date,
    referenceYear: number,
  ): number {
    const referenceDate = new Date(referenceYear, 0, 1) // January 1st of the reference year
    const diffTime = referenceDate.getTime() - hiringDate.getTime()
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25)
    return Math.floor(Math.max(0, diffYears))
  }

  private calculateMonthsElapsed(fromDate: Date, toDate: Date): number {
    const years = toDate.getFullYear() - fromDate.getFullYear()
    const months = toDate.getMonth() - fromDate.getMonth()
    return Math.max(0, years * 12 + months)
  }

  private getAnnualHolidayHours(
    configs: CompanyHolidayConfigType[],
    yearsOfService: number,
  ): number {
    // Sort configs by years_min
    const sortedConfigs = [...configs].sort(
      (a, b) => a.years_min - b.years_min,
    )

    // Find the applicable tier
    for (const config of sortedConfigs) {
      const isAboveMin = yearsOfService >= config.years_min
      const isBelowMax =
        config.years_max === null || yearsOfService < config.years_max

      if (isAboveMin && isBelowMax) {
        return config.holiday_hours
      }
    }

    // If no tier matches, use the highest tier (for very senior employees)
    const highestTier = sortedConfigs[sortedConfigs.length - 1]
    return highestTier?.holiday_hours ?? 0
  }
}

