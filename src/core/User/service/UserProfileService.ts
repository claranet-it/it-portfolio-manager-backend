import { UserProfileType, UserProfileWithUidType } from '../model/user.model'
import { UserProfileRepositoryInterface } from '../repository/UserProfileRepositoryInterface'

export class UserProfileService {
  constructor(private userProfileRepository: UserProfileRepositoryInterface) {}

  async getUserProfile(uid: string): Promise<UserProfileType | null> {
    return await this.userProfileRepository.getUserProfile(uid)
  }

  async saveUserProfile(
    uid: string,
    { name, crew, company }: UserProfileType,
  ): Promise<void> {
    return this.userProfileRepository.saveUserProfile(uid, {
      name,
      crew,
      company,
    })
  }

  async getAllUserProfiles(): Promise<UserProfileWithUidType[]> {
    return this.userProfileRepository.getAllUserProfiles()
  }

  async getByCompany(company: string): Promise<UserProfileWithUidType[]> {
    return this.userProfileRepository.getByCompany(company)
  }
}
