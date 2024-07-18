import {
  TimeEntryReadParamWithUserType,
  TimeEntryRowType,
  deleteTimeEntryWithUserType,
  CnaReadParamType,
  TimeEntryRowWithProjectType,
} from '../model/timeEntry.model'

export interface TimeEntryRepositoryInterface {
  find(params: TimeEntryReadParamWithUserType): Promise<TimeEntryRowType[]>
  findTimeOffForCna(
    params: CnaReadParamType,
  ): Promise<TimeEntryRowWithProjectType[]>
  saveMine(params: TimeEntryRowType): Promise<void>
  delete(params: deleteTimeEntryWithUserType): Promise<void>
}