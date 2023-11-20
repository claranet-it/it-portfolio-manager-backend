import { UserWithProfileType } from '@src/models/user.model'
import { JwtTokenType } from '@src/core/JwtToken/model/jwtToken.model'
import { UserProfileService } from './UserProfileService'

export class UserService {
  constructor(private userProfileService: UserProfileService) {}

  async getUser(jwtToken: JwtTokenType): Promise<UserWithProfileType> {
    const userProfile = await this.userProfileService.getUserProfile(
      jwtToken.email,
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
    }
  }
}
