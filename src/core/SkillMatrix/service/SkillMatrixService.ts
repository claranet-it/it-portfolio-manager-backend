import { SkillMatrixRepositoryInterface } from '../repository/SkillMatrixRepositoryInterface'
import { SkillMatrixList } from '@src/core/SkillMatrix/model/skillMatrixList.model'
import {
  SkillMatrixMineResponseType,
  SkillMatrixQueryParamsType,
  SkillMatrixReadParamsType,
  SkillMatrixResponseType,
  SkillMatrixUpdateOfUserParamsType,
  SkillMatrixUpdateParamsType,
} from '@src/core/SkillMatrix/model/skillMatrix.model'
import { JwtTokenType } from '@src/core/JwtToken/model/jwtToken.model'
import { UserProfileService } from '@src/core/User/service/UserProfileService'
import { UserProfileNotInitializedError } from '@src/core/customExceptions/UserProfileNotInitializedError'

export class SkillMatrixService {
  constructor(
    private skillMatrixRepository: SkillMatrixRepositoryInterface,
    private userProfileService: UserProfileService,
  ) { }

  async getAllSkillMatrix(
    params: SkillMatrixQueryParamsType,
  ): Promise<SkillMatrixList> {
    return await this.skillMatrixRepository.getAllSkillMatrix(params)
  }

  async getMineSkillMatrixFormattedResponse(
    jwtToken: JwtTokenType,
  ): Promise<SkillMatrixMineResponseType> {
    return await this.skillMatrixRepository.getMineSkillMatrixFormattedResponse(
      jwtToken.email,
    )
  }

  async getUserSkillMatrixFormattedResponse(
    email: string,
  ): Promise<SkillMatrixMineResponseType> {
    return await this.skillMatrixRepository.getMineSkillMatrixFormattedResponse(
      email,
    )
  }

  async getAllSkillMatrixFormattedResponse(
    params: SkillMatrixReadParamsType,
  ): Promise<SkillMatrixResponseType> {
    return await this.skillMatrixRepository.getAllSkillMatrixFormattedResponse(
      params,
    )
  }

  async save(
    jwtToken: JwtTokenType,
    skillMatrixUpdateParams: SkillMatrixUpdateParamsType,
  ): Promise<void> {
    const userProfile = await this.userProfileService.getUserProfile(
      jwtToken.email,
      jwtToken.company,
    )
    if (!userProfile) {
      throw new UserProfileNotInitializedError()
    }

    return await this.skillMatrixRepository.save(
      jwtToken.email,
      userProfile,
      skillMatrixUpdateParams,
    )
  }

  async updateSkillMatrixOfUser(
    skillMatrixUpdateOfUserParams: SkillMatrixUpdateOfUserParamsType,
  ): Promise<void> {
    return await this.skillMatrixRepository.updateSkillMatrixOfUser(
      skillMatrixUpdateOfUserParams,
    )
  }

  async delete(uid: string) {
    await this.skillMatrixRepository.delete(uid)
  }

  async deleteSkillMatrixByCompany(companyDomain: string): Promise<void> {
    const originalData = await this.skillMatrixRepository.getData()
    if (originalData?.length) {
      const allUsersCompany = await this.userProfileService.getByCompany(companyDomain)
      for (const user of allUsersCompany) {
        try {
          await this.skillMatrixRepository.delete(user.uid)
        } catch (error) {
          console.error("Error: delete skillMatrix of a company", error)
          for (const item of originalData) {
            this.skillMatrixRepository.restoreData(item)
          }
          break;
        }
      }
    }
  }


}
