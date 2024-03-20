import { UserProfileType, UserProfileWithUidType } from '../model/user.model'
import { UserProfileRepositoryInterface } from '../repository/UserProfileRepositoryInterface'

export class UserProfileService {
  constructor(private userProfileRepository: UserProfileRepositoryInterface) {}

  async getUserProfile(uid: string): Promise<UserProfileType | null> {
    return await this.userProfileRepository.getUserProfile(uid)
  }

  async saveUserProfile(
    uid: string,
    name: string,
    userProfile: UserProfileType,
  ): Promise<void> {
    return this.userProfileRepository.saveUserProfile(uid, name, userProfile)
  }

  async getAllUserProfiles(): Promise<UserProfileWithUidType[]> {
    return this.userProfileRepository.getAllUserProfiles()
  }

  async getByCompany(company: string): Promise<UserProfileWithUidType[]> {
    return this.userProfileRepository.getByCompany(company)
  }

  async delete(uid: string) {
    await this.userProfileRepository.delete(uid)
  }
}
