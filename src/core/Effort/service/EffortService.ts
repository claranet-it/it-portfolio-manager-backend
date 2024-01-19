import { UserProfileNotInitializedError } from '@src/core/customExceptions/UserProfileNotInitializedError'
import {
  EffortReadParamsType,
  EffortResponseType,
  EffortRowType,
} from '../model/effort'
import { EffortRepositoryInterface } from '../repository/EffortRepositoryInterface'
import { UserProfileService } from '@src/core/User/service/UserProfileService'
import { EffortList } from '../model/effortList'
import { UserProfileWithUidType } from '@src/core/User/model/user.model'

export class EffortService {
  constructor(
    private effortRepository: EffortRepositoryInterface,
    private userProfileService: UserProfileService,
  ) {}

  async getEffortFormattedResponse(
    params: EffortReadParamsType,
  ): Promise<EffortResponseType> {
    const efforts = await this.effortRepository.getEffort(params)
    const userProfiles = await this.userProfileService.getAllUserProfiles();
    const results = new EffortList([]);
    userProfiles.forEach(userProfile => {
      const effortsOfUser = efforts.filter((effort) => effort.uid === userProfile.uid);
      effortsOfUser.forEach(effortOfUser =>{
        results.pushEffort({...userProfile, ...effortOfUser});
      })
    });
    return results.toEffortReponse()
  }

  async getEffortNextFormattedResponse(
    params: EffortReadParamsType,
  ): Promise<EffortResponseType> {
    const users = await this.getUserProfiles(params);

    const efforts = new EffortList([])
    for (const user of users) {
      params.uid = user.uid

      for (let i = 0; i <= 3; i++) {
        const date = new Date()
        date.setDate(1)
        date.setMonth(date.getMonth() + i)
        const month_year =
          ('0' + (date.getMonth() + 1)).slice(-2) +
          '_' +
          date.getFullYear().toString().slice(-2)

        params.month_year = month_year
        const effortsOfUser = await this.effortRepository.getEffort(params);
        const effortOfUser = effortsOfUser[0];
        efforts.pushEffort({
          uid: user.uid,
          month_year: month_year,
          confirmedEffort: effortOfUser?.confirmedEffort ?? 0,
          tentativeEffort: effortOfUser?.tentativeEffort ?? 0,
          notes: effortOfUser?.notes ?? '',
          crew: user.crew,
          company:  user.company,
          name: user.name
        })
      }
    }

    return efforts.toEffortReponse()
  }

  private async getUserProfiles(params:EffortReadParamsType): Promise<UserProfileWithUidType[]> {
    if(params.uid){
        const userProfile = await this.userProfileService.getUserProfile(params.uid);
        if(!userProfile){
          throw new UserProfileNotInitializedError();
        }
        return [{uid: params.uid, ...userProfile}]
    }
    else if (params.company){
      return this.userProfileService.getByCompany(params.company);
    }
    return await this.userProfileService.getAllUserProfiles();
  }

  async saveEffort(params: EffortRowType): Promise<void> {
    const userProfile = await this.userProfileService.getUserProfile(params.uid)
    if (!userProfile) {
      throw new UserProfileNotInitializedError()
    }

    await this.effortRepository.saveEffort(params)
  }
}
