import { UserProfileType } from '@src/core/User/model/user.model'
import { EffortReadParamsType, EffortRowType } from '../model/effort'
import { EffortList } from '../model/effortList'

export interface EffortRepositoryInterface {
  getEffort(params: EffortReadParamsType): Promise<EffortList>

  saveEffort(userProfile: UserProfileType, params: EffortRowType): Promise<void>
}
