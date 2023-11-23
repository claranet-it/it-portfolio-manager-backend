import { EffortReadParamsType, EffortRowType } from '../model/effort'
import { EffortList } from '../model/effortList'

export interface EffortRepositoryInterface {
  getEffort(params: EffortReadParamsType): Promise<EffortList>

  saveEffort(params: EffortRowType): Promise<void>
}
