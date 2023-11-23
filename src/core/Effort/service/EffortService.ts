import { UserProfileNotInitializedError } from '@src/core/customExceptions/UserProfileNotInitializedError'
import {
  EffortReadParamsType,
  EffortResponseType,
  EffortRowType,
} from '../model/effort'
import { EffortRepositoryInterface } from '../repository/EffortRepositoryInterface'
import { UserProfileService } from '@src/core/User/service/UserProfileService'

export class EffortService {
  constructor(
    private effortRepository: EffortRepositoryInterface,
    private userProfileService: UserProfileService,
  ) {}

  async getEffortFormattedResponse(
    params: EffortReadParamsType,
  ): Promise<EffortResponseType> {
    const efforts = await this.effortRepository.getEffort(params)

    return efforts.toEffortReponse()
  }

  async saveEffort(params: EffortRowType): Promise<void> {
    const userProfile = await this.userProfileService.getUserProfile(params.uid)
    if (!userProfile) {
      throw new UserProfileNotInitializedError()
    }

    await this.effortRepository.saveEffort(params)
  }
}
