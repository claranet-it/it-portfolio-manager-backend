import { EffortReadParamsType, EffortRowType } from '../model/effort'

export interface EffortRepositoryInterface {
  getEffort(params: EffortReadParamsType): Promise<EffortRowType[]>

  saveEffort(params: EffortRowType): Promise<void>
}
