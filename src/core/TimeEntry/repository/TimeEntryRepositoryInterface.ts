import {
  TimeEntryReadParamWithUserType,
  TimeEntryRowType,
  deleteTimeEntryWithUserType,
  CnaReadParamType,
  TimeEntryRowWithProjectType,
  TimeEntryRowWithProjectEntityType,
  TimeEntryReadParamWithCompanyAndCrewType,
} from '../model/timeEntry.model'

export interface TimeEntryRepositoryInterface {
  find(
    params: TimeEntryReadParamWithUserType,
  ): Promise<TimeEntryRowWithProjectEntityType[]>
  findTimeOffForFlowing(
    params: CnaReadParamType,
  ): Promise<TimeEntryRowWithProjectType[]>
  findTimeOffForClaranet(
    params: CnaReadParamType,
  ): Promise<TimeEntryRowWithProjectType[]>
  findTimeEntriesForReport(
    params: TimeEntryReadParamWithCompanyAndCrewType,
  ): Promise<TimeEntryRowWithProjectEntityType[]>
  save(params: TimeEntryRowType): Promise<void>
  delete(params: deleteTimeEntryWithUserType): Promise<void>
}
