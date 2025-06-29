import { ReportProjectsWithCompanyType } from '@src/core/Report/model/projects.model'
import {
  TimeEntryReadParamWithUserType,
  TimeEntryRowType,
  deleteTimeEntryWithUserType,
  CnaReadParamType,
  TimeEntryRowWithProjectType,
  TimeEntryRowWithProjectEntityType,
  TimeEntryReadParamWithCompanyAndCrewType, TimeEntriesToEncryptType,
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
  getTimeEntriesFilterBy(params: ReportProjectsWithCompanyType,
  ): Promise<TimeEntryRowWithProjectEntityType[]>
  getTimeEntriesByCompany(companyName: string): Promise<TimeEntriesToEncryptType[]>
}
