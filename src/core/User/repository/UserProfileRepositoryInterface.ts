import { UserProfileType } from '@src/models/user.model'

export interface UserProfileRepositoryInterface {
  getUserProfile(uid: string): Promise<UserProfileType | null>
  saveUserProfile(
    uid: string,
    { crew, company }: UserProfileType,
  ): Promise<void>
}
