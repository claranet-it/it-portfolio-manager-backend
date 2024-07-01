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
    company: string,
    picture: string,
    userProfile: UpdateUserProfileType,
  ): Promise<void>

  getAllUserProfiles(): Promise<UserProfileWithUidType[]>

  getByName(name: string, company: string): Promise<{ email: string }[]>

  getByCompany(company: string): Promise<UserProfileWithUidType[]>

  delete(uid: string): Promise<void>
}
