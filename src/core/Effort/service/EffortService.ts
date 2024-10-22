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
import { EffortExceedsMaxError } from '@src/core/customExceptions/EffortExcedesMaxError'

export class EffortService {
  constructor(
    private effortRepository: EffortRepositoryInterface,
    private userProfileService: UserProfileService,
  ) {}

  async getEffortFormattedResponse(
    params: EffortReadParamsType,
  ): Promise<EffortResponseType> {
    const efforts = await this.effortRepository.getEffort(params)
    const userProfiles =
      await this.userProfileService.getAllActiveUserProfiles()
    const results = new EffortList([])
    userProfiles.forEach((userProfile) => {
      const effortsOfUser = efforts.filter(
        (effort) => effort.uid === userProfile.uid,
      )
      effortsOfUser.forEach((effortOfUser) => {
        results.pushEffort({ ...userProfile, ...effortOfUser })
      })
    })
    return results.toEffortReponse()
  }

  async getEffortNextFormattedResponse(
    params: EffortReadParamsType,
  ): Promise<EffortResponseType> {
    const users = await this.getUserProfiles(params)

    const efforts = new EffortList([])
    for (const user of users) {
      params.uid = user.uid
      for (let i = 0; i <= params.months; i++) {
        const date = new Date()
        date.setDate(1)
        date.setMonth(date.getMonth() + i)
        const month_year =
          ('0' + (date.getMonth() + 1)).slice(-2) +
          '_' +
          date.getFullYear().toString().slice(-2)

        params.month_year = month_year
        const effortsOfUser = await this.effortRepository.getEffort(params)
        const effortOfUser = effortsOfUser[0]
        efforts.pushEffort({
          uid: user.uid,
          month_year: month_year,
          confirmedEffort: effortOfUser?.confirmedEffort ?? 0,
          tentativeEffort: effortOfUser?.tentativeEffort ?? 0,
          notes: effortOfUser?.notes ?? '',
          crew: user.crew,
          company: user.company,
          name: user.name,
        })
      }
    }

    return efforts.toEffortReponse()
  }

  async getEffortPeriod(
    uuids: string[],
    from: string,
    month_number: number,
  ): Promise<EffortRowType[]> {
    const result: EffortRowType[] = []
    const startMonth = parseInt(from.split('_')[0])
    const startYear = parseInt(from.split('_')[1])
    for await (const uuid of uuids) {
      for (let i = 0; i < month_number; i++) {
        const date = new Date(startYear, startMonth, 1)
        date.setMonth(date.getMonth() + i)
        const month_year =
          ('0' + (date.getMonth() + 1)).slice(-2) +
          '_' +
          date.getFullYear().toString().slice(-2)
        const effort = (
          await this.effortRepository.getEffort({ uid: uuid, month_year })
        )[0]
        if (effort) {
          result.push(effort)
        }
      }
    }
    return result
  }

  private async getUserProfiles(
    params: EffortReadParamsType,
  ): Promise<UserProfileWithUidType[]> {
    if (params.uid) {
      const userProfile = await this.userProfileService.getUserProfile(
        params.uid,
        params.company,
      )
      if (!userProfile) {
        throw new UserProfileNotInitializedError()
      }
      return [{ uid: params.uid, ...userProfile }]
    } else if (params.company) {
      return (
        await this.userProfileService.getByCompany(params.company)
      ).filter((user) => !user.disabled)
    }
    return await this.userProfileService.getAllActiveUserProfiles()
  }

  async saveEffort(
    params: EffortRowType,
    company: string | undefined,
  ): Promise<void> {
    const userProfile = await this.userProfileService.getUserProfile(
      params.uid,
      company,
    )
    if (!userProfile) {
      throw new UserProfileNotInitializedError()
    }
    if (params.confirmedEffort + params.tentativeEffort > 100) {
      throw new EffortExceedsMaxError(params.month_year)
    }

    await this.effortRepository.saveEffort(params)
  }

  async delete(uid: string) {
    await this.effortRepository.delete(uid)
  }
}
