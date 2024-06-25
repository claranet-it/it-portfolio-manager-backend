import {ProductivityReportResponseType} from "@src/core/Report/model/productivity";
import {TimeEntryReadParamWithUserType} from "@src/core/TimeEntry/model/timeEntry.model";

export interface ReportRepositoryInterface {
  getProductivityReport(params: TimeEntryReadParamWithUserType): Promise<ProductivityReportResponseType>
}
