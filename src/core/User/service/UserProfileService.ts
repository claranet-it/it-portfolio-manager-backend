import {
  CnaUserProfileListType,
  CompleteUserProfileType,
  UserCompanyType,
  UserProfileType,
} from '../model/user.model'
import { UserProfileRepositoryInterface } from '../repository/UserProfileRepositoryInterface'

export class UserProfileService {
  constructor(private userProfileRepository: UserProfileRepositoryInterface) {}

  async getUserProfile(
    uid: string,
    company: string | undefined = undefined,
  ): Promise<UserProfileType | null> {
    return await this.userProfileRepository.getUserProfile(uid, company)
  }

  async getCompleteUserProfile(
    uid: string,
  ): Promise<CompleteUserProfileType | null> {
    return await this.userProfileRepository.getCompleteUserProfile(uid)
  }

  async saveUserProfile(
    uid: string,
    name: string,
    company: string,
    picture: string,
    userProfile: UserProfileType,
  ): Promise<void> {
    return this.userProfileRepository.saveUserProfile(
      uid,
      name,
      company,
      picture,
      userProfile,
    )
  }

  async getAllUserProfiles(): Promise<CompleteUserProfileType[]> {
    return this.userProfileRepository.getAllUserProfiles()
  }

  async getAllActiveUserProfiles(): Promise<CompleteUserProfileType[]> {
    return this.userProfileRepository.getAllActiveUserProfiles()
  }

  async getByCompany(company: string): Promise<CompleteUserProfileType[]> {
    return this.userProfileRepository.getByCompany(company)
  }

  async delete(uid: string) {
    await this.userProfileRepository.delete(uid)
  }

  async getUsersForCna(
    params: UserCompanyType,
  ): Promise<CnaUserProfileListType> {
    let usersProfiles = []
    if (params.company === 'flowing') {
      usersProfiles = await this.userProfileRepository.getFlowingUserProfiles()
    } else {
      usersProfiles = await this.userProfileRepository.getClaranetUserProfiles()
    }
    usersProfiles = usersProfiles.filter((profile) => !profile.disabled)

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
