import {
  CompanyHolidayConfigType,
  SaveCompanyHolidayConfigType,
  SaveUserHolidayBaseType,
  UserHolidayBaseType,
} from '../model/holiday.model'

export interface HolidayRepositoryInterface {
  // Company holiday configuration
  getCompanyHolidayConfig(companyId: string): Promise<CompanyHolidayConfigType[]>
  saveCompanyHolidayConfig(
    companyId: string,
    config: SaveCompanyHolidayConfigType,
  ): Promise<CompanyHolidayConfigType>
  deleteCompanyHolidayConfig(companyId: string, id: string): Promise<void>

  // User holiday base
  getUserHolidayBase(email: string, companyId: string): Promise<UserHolidayBaseType | null>
  getAllUserHolidayBases(companyId: string): Promise<UserHolidayBaseType[]>
  saveUserHolidayBase(
    companyId: string,
    data: SaveUserHolidayBaseType,
  ): Promise<UserHolidayBaseType>
  deleteUserHolidayBase(email: string, companyId: string): Promise<void>

  // Time entries for holiday (FERIE) calculation
  getHolidayHours(
    email: string,
    companyId: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<number>
}

