import { ProductivityReportReadParamWithCompanyType } from '@src/core/Report/model/productivity.model'
import { TimeEntryRowType } from '@src/core/TimeEntry/model/timeEntry.model'

export interface ReportRepositoryInterface {
  getProductivityReport(
    params: ProductivityReportReadParamWithCompanyType,
  ): Promise<TimeEntryRowType[]>
  getProjectTypes(
    company: string,
  ): Promise<{ project: string; projectType: string }[]>
}
