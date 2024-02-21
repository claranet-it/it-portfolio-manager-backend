import { EffortService } from '@src/core/Effort/service/EffortService'
import { UserProfileService } from './UserProfileService'
import { SkillMatrixService } from '@src/core/SkillMatrix/service/SkillMatrixService'

export class ResignedPeopleService {
  constructor(
    private userProfileService: UserProfileService,
    private effortService: EffortService,
    private skillMatrixService: SkillMatrixService,
  ) {}

  async removeResigned(uid: string) {
    await this.userProfileService.delete(uid)
    await this.effortService.delete(uid)
    await this.skillMatrixService.delete(uid)
  }
}
