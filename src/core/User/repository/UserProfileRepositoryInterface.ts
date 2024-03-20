import {
  UpdateUserProfileType,
  UserProfileType,
  UserProfileWithUidType,
} from '@src/core/User/model/user.model'

export interface UserProfileRepositoryInterface {
  getUserProfile(uid: string): Promise<UserProfileType | null>

  saveUserProfile(
    uid: string,
    name: string,
    userProfile: UpdateUserProfileType,
  ): Promise<void>

  getAllUserProfiles(): Promise<UserProfileWithUidType[]>

  getByCompany(company: string): Promise<UserProfileWithUidType[]>

  delete(uid: string): Promise<void>
}
