import { UserProfileType } from '../model/user.model'
import { UserProfileRepositoryInterface } from '../repository/UserProfileRepositoryInterface'

export class UserProfileService {
  constructor(private userProfileRepository: UserProfileRepositoryInterface) {}

  async getUserProfile(uid: string): Promise<UserProfileType | null> {
    return await this.userProfileRepository.getUserProfile(uid)
  }

  async saveUserProfile(
    uid: string,
    { crew, company }: UserProfileType,
  ): Promise<void> {
    return this.userProfileRepository.saveUserProfile(uid, { crew, company })
  }
}
