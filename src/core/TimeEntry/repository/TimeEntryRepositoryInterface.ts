import {
  TimeEntryReadParamWithUserType,
  TimeEntryRowType,
  deleteTimeEntryWithUserType,
  CnaReadParamType,
  TimeEntryRowWithProjectType,
  TimeEntryRowWithProjectEntityType,
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
  saveMine(params: TimeEntryRowType): Promise<void>
  delete(params: deleteTimeEntryWithUserType): Promise<void>
}
