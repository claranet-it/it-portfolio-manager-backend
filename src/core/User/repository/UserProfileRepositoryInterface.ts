import {
  UserProfileType,
  UserProfileWithUidType,
} from '@src/core/User/model/user.model'

export interface UserProfileRepositoryInterface {
  getUserProfile(uid: string): Promise<UserProfileType | null>

  saveUserProfile(
    uid: string,
    { name, crew, company }: UserProfileType,
  ): Promise<void>

  getAllUserProfiles(): Promise<UserProfileWithUidType[]>
}
