import {
  CnaUserProfileListType,
  UserCompanyType,
  UserWithProfileType,
} from '@src/core/User/model/user.model'
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
      crewLeader: userProfile.crewLeader,
      place: userProfile.place,
      workingExperience: userProfile.workingExperience,
      education: userProfile.education,
      certifications: userProfile.certifications,
    }
  }

  async getUsers(params: UserCompanyType): Promise<CnaUserProfileListType> {
    let usersProfiles = []
    if (params.company === 'flowing') {
      const user1 = await this.userProfileService.getCompleteUserProfile('stefania.ceccacci@claranet.com')
      const user2 = await this.userProfileService.getCompleteUserProfile('manuel.gherardi@claranet.com')
      usersProfiles.push(user1, user2)
    } else {
      usersProfiles = await this.userProfileService.getAllUserProfiles()
    }

    return Promise.all(
        usersProfiles.map(async (profile) => {

        if (!profile) {
          return {
            email: '',
            id: '',
            name: '',
          }
        }

        return {
          email: profile?.uid,
          id: profile?.uid,
          name: profile?.name,
        }
      }),
    )
  }
}
