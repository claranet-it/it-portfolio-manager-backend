import { TimeEntryReadParamWithUserType, TimeEntryRowType } from "../model/timeEntry.model";

export interface TimeEntryRepositoryInterface{
    find(params: TimeEntryReadParamWithUserType): Promise<TimeEntryRowType[]>
    saveMine(params: TimeEntryRowType): Promise<void>
}