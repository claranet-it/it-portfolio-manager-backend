import { UserWithProfileType } from '@src/core/User/model/user.model'
import { JwtTokenType } from '@src/core/JwtToken/model/jwtToken.model'
import { UserProfileService } from './UserProfileService'

export class UserService {
  constructor(private userProfileService: UserProfileService) {}

  async getUser(jwtToken: JwtTokenType): Promise<UserWithProfileType> {
    const userProfile = await this.userProfileService.getUserProfile(
      jwtToken.email,
      jwtToken.company,
    )
    if (!userProfile) {
      return {
        ...jwtToken,
      }
    }
    return {
      ...jwtToken,
      crew: userProfile.crew,
      company: userProfile.company,
      crewLeader: userProfile.crewLeader,
      place: userProfile.place,
      workingExperience: userProfile.workingExperience,
      education: userProfile.education,
      certifications: userProfile.certifications,
    }
  }
}
