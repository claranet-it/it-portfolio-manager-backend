import { CompleteUserProfileType, UserProfileType } from '../model/user.model'
import { UserProfileRepositoryInterface } from '../repository/UserProfileRepositoryInterface'

export class UserProfileService {
  constructor(private userProfileRepository: UserProfileRepositoryInterface) {}

  async getUserProfile(uid: string): Promise<UserProfileType | null> {
    return await this.userProfileRepository.getUserProfile(uid)
  }

  async getCompleteUserProfile(uid: string): Promise<CompleteUserProfileType | null> {
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

  async getByCompany(company: string): Promise<CompleteUserProfileType[]> {
    return this.userProfileRepository.getByCompany(company)
  }

  async delete(uid: string) {
    await this.userProfileRepository.delete(uid)
  }
}
