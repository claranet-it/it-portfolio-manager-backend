import { ProductivityReportResponseType } from '@src/core/Report/model/productivity.model'
import { ReportRepositoryInterface } from '@src/core/Report/repository/ReportRepositoryInterface'
import { TimeEntryReadParamWithUserType } from '@src/core/TimeEntry/model/timeEntry.model'

export class ReportService {
  constructor(private reportRepository: ReportRepositoryInterface) {}

  async getProductivityReport(
    params: TimeEntryReadParamWithUserType,
  ): Promise<ProductivityReportResponseType> {
    return this.reportRepository.getProductivityReport(params)
  }
}
