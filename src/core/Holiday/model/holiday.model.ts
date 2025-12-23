import { Static, Type } from '@sinclair/typebox'

// Company holiday configuration - defines hours based on seniority
export const CompanyHolidayConfig = Type.Object({
  id: Type.Optional(Type.String()),
  company_id: Type.String(),
  years_min: Type.Integer(),
  years_max: Type.Union([Type.Integer(), Type.Null()]),
  holiday_hours: Type.Number(),
})

export type CompanyHolidayConfigType = Static<typeof CompanyHolidayConfig>

export const CompanyHolidayConfigList = Type.Array(CompanyHolidayConfig)
export type CompanyHolidayConfigListType = Static<typeof CompanyHolidayConfigList>

// User's holiday base - for tracking from a specific reference point
export const UserHolidayBase = Type.Object({
  id: Type.Optional(Type.String()),
  email: Type.String(),
  company_id: Type.String(),
  hiring_date: Type.String({ format: 'date' }),
  base_remaining_hours: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  reference_month: Type.Optional(Type.Union([Type.Integer({ minimum: 1, maximum: 12 }), Type.Null()])),
  reference_year: Type.Optional(Type.Union([Type.Integer(), Type.Null()])),
})

export type UserHolidayBaseType = Static<typeof UserHolidayBase>

// Request to save user holiday base
export const SaveUserHolidayBase = Type.Object({
  email: Type.String(),
  hiring_date: Type.String({ format: 'date' }),
  base_remaining_hours: Type.Optional(Type.Number()),
  reference_month: Type.Optional(Type.Integer({ minimum: 1, maximum: 12 })),
  reference_year: Type.Optional(Type.Integer()),
})

export type SaveUserHolidayBaseType = Static<typeof SaveUserHolidayBase>

// Request to save company holiday config
export const SaveCompanyHolidayConfig = Type.Object({
  years_min: Type.Integer({ minimum: 0 }),
  years_max: Type.Optional(Type.Integer()),
  holiday_hours: Type.Number({ minimum: 0 }),
})

export type SaveCompanyHolidayConfigType = Static<typeof SaveCompanyHolidayConfig>

// Response for remaining holidays
export const RemainingHolidaysResponse = Type.Object({
  email: Type.String(),
  company_id: Type.String(),
  hiring_date: Type.String(),
  years_of_service: Type.Number(),
  annual_holiday_hours: Type.Number(),
  used_holiday_hours: Type.Number(),
  remaining_holiday_hours: Type.Number(),
  calculation_method: Type.Union([
    Type.Literal('from_reference'),
    Type.Literal('from_year_start'),
  ]),
  reference_month: Type.Optional(Type.Union([Type.Integer(), Type.Null()])),
  reference_year: Type.Optional(Type.Union([Type.Integer(), Type.Null()])),
  year: Type.Integer(),
})

export type RemainingHolidaysResponseType = Static<typeof RemainingHolidaysResponse>

// Query params for remaining holidays
export const RemainingHolidaysQueryParams = Type.Object({
  year: Type.Optional(Type.Integer()),
})

export type RemainingHolidaysQueryParamsType = Static<typeof RemainingHolidaysQueryParams>

