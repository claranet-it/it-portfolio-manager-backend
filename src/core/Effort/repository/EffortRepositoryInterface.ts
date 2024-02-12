import {EffortRowType, GetEffortParamsType } from '../model/effort'

export interface EffortRepositoryInterface {
  getEffort(params: GetEffortParamsType): Promise<EffortRowType[]>

  saveEffort(params: EffortRowType): Promise<void>
}
