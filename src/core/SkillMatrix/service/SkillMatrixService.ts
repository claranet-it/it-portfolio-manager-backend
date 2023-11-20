import { SkillMatrixRepositoryInterface } from '../repository/SkillMatrixRepositoryInterface'
import { SkillMatrixList } from '@src/models/skillMatrixList.model'
import {
  SkillMatrixMineResponseType,
  SkillMatrixQueryParamsType,
  SkillMatrixReadParamsType,
  SkillMatrixResponseType,
  SkillMatrixUpdateOfUserParamsType,
  SkillMatrixUpdateParamsType,
} from '@src/models/skillMatrix.model'
import { JwtTokenType } from '@src/core/JwtToken/model/jwtToken.model'
import { UserProfileService } from '@src/core/User/service/UserProfileService'
import { UserProfileNotInitializedError } from '@src/core/customExceptions/UserProfileNotInitializedError'

export class SkillMatrixService {
  constructor(
    private skillMatrixRepository: SkillMatrixRepositoryInterface,
    private userProfileService: UserProfileService,
  ) {}

  async getAllSkillMatrix(
    params: SkillMatrixQueryParamsType,
  ): Promise<SkillMatrixList> {
    return await this.skillMatrixRepository.getAllSkillMatrix(params)
  }

  async getMineSkillMatrixFormattedReponse(
    jwtToken: JwtTokenType,
  ): Promise<SkillMatrixMineResponseType> {
    return await this.skillMatrixRepository.getMineSkillMatrixFormattedReponse(
      jwtToken.email,
    )
  }

  async getAllSkillMatrixFormattedResponse(
    params: SkillMatrixReadParamsType,
  ): Promise<SkillMatrixResponseType> {
    return await this.skillMatrixRepository.getAllSkillMatrixFormattedResponse(
      params,
    )
  }

  async saveMineSkillMatrix(
    jwtToken: JwtTokenType,
    skillMatrixUpdateParams: SkillMatrixUpdateParamsType,
  ): Promise<void> {
    const userProfile = await this.userProfileService.getUserProfile(
      jwtToken.email,
    )
    if (!userProfile) {
      throw new UserProfileNotInitializedError()
    }

    return await this.skillMatrixRepository.saveMineSkillMatrix(
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
}
