import { TimeEntryReadParamWithUserType, TimeEntryRowType } from "../model/timeEntry.model";
import { TimeEntryRepositoryInterface } from "../repository/TimeEntryRepositoryIntereface";

export class TimeEntryService{
    constructor(private timeEntryRepostiroy: TimeEntryRepositoryInterface){}

    find(params: TimeEntryReadParamWithUserType): Promise<TimeEntryRowType[]>{
        return this.timeEntryRepostiroy.find(params)
    }
}