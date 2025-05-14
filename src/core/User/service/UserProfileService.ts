import {
  CnaUserProfileListType,
  CompleteUserProfileType,
  PatchUserProfileType,
  UserCompanyType,
  UserProfileType,
} from '../model/user.model'
import { UserProfileRepositoryInterface } from '../repository/UserProfileRepositoryInterface'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { BadRequestException } from '@src/shared/exceptions/BadRequestException'
import { ForbiddenException } from '@src/shared/exceptions/ForbiddenException'

export class UserProfileService {
  constructor(private userProfileRepository: UserProfileRepositoryInterface) { }

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

  async delete(uid: string): Promise<void> {
    await this.userProfileRepository.delete(uid)
  }

  async reactivateUser(uid: string): Promise<void> {
    await this.userProfileRepository.reactivateUser(uid)
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

  async patch(
    role: string,
    id: string,
    patchUserProfile: PatchUserProfileType,
  ): Promise<void> {
    const userProfile = await this.userProfileRepository.getUserProfileById(id)

    if (!userProfile) {
      throw new NotFoundException('Not found')
    }

    if (patchUserProfile.crew) {
      userProfile.crew = patchUserProfile.crew
    }

    if (patchUserProfile.role !== undefined) {
      if (!this.checkPatchableRole(role, patchUserProfile.role)) {
        throw new ForbiddenException('Forbidden')
      }
      userProfile.role = patchUserProfile.role
    }

    return this.userProfileRepository.save(id, userProfile)
  }

  private checkPatchableRole(currentRole: string, targetRole: string): boolean {
    const roleHierarchy = ['', 'TEAM_LEADER', 'ADMIN', 'SUPERADMIN']

    const currentRoleIndex = roleHierarchy.indexOf(currentRole)
    const targetRoleIndex = roleHierarchy.indexOf(targetRole)

    if (currentRoleIndex === -1 || targetRoleIndex === -1) {
      throw new BadRequestException('Invalid role')
    }

    return currentRoleIndex > targetRoleIndex
  }

  async deleteUsersByCompany(companyDomain: string): Promise<void> {
    const allUsersCompany = await this.getByCompany(companyDomain)
    for (const user of allUsersCompany) {
      await this.userProfileRepository.removeUser(user.uid)
    }
  }
}
