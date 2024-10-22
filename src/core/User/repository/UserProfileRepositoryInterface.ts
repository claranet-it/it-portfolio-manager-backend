import {
  CompleteUserProfileType,
  UpdateUserProfileType,
  UserProfileType,
} from '@src/core/User/model/user.model'

export interface UserProfileRepositoryInterface {
  getUserProfile(
    uid: string,
    company: string | undefined,
  ): Promise<UserProfileType | null>

  getCompleteUserProfile(uid: string): Promise<CompleteUserProfileType | null>

  saveUserProfile(
    uid: string,
    name: string,
    company: string,
    picture: string,
    userProfile: UpdateUserProfileType,
  ): Promise<void>

  getAllUserProfiles(): Promise<CompleteUserProfileType[]>

  getAllActiveUserProfiles(): Promise<CompleteUserProfileType[]>

  getFlowingUserProfiles(): Promise<CompleteUserProfileType[]>

  getClaranetUserProfiles(): Promise<CompleteUserProfileType[]>

  getByName(name: string, company: string): Promise<{ email: string }[]>

  getByCompany(company: string): Promise<CompleteUserProfileType[]>

  delete(uid: string): Promise<void>

  getDisabled(company: string): Promise<CompleteUserProfileType[]>

  getRole(uid: string): Promise<string>
}
