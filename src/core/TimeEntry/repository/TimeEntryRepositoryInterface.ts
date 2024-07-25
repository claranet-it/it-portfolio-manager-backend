import {
  TimeEntryReadParamWithUserType,
  TimeEntryRowType,
  deleteTimeEntryWithUserType,
  CnaReadParamType,
  TimeEntryRowWithProjectType,
  TimeEntryReadParamWithCompanyAndCrewType,
} from '../model/timeEntry.model'

export interface TimeEntryRepositoryInterface {
  find(params: TimeEntryReadParamWithUserType): Promise<TimeEntryRowType[]>
  findTimeOffForCna(
    params: CnaReadParamType,
  ): Promise<TimeEntryRowWithProjectType[]>
  findTimeEntriesForReport(
    params: TimeEntryReadParamWithCompanyAndCrewType,
  ): Promise<TimeEntryRowType[]>
  saveMine(params: TimeEntryRowType): Promise<void>
  delete(params: deleteTimeEntryWithUserType): Promise<void>
}
