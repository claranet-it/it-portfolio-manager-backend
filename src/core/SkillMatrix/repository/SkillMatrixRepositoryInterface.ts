import {
  SkillMatrixMineResponseType,
  SkillMatrixQueryParamsType,
  SkillMatrixReadParamsType,
  SkillMatrixResponseType,
  SkillMatrixUpdateOfUserParamsType,
  SkillMatrixUpdateParamsType,
} from '@src/models/skillMatrix.model'
import { SkillMatrixList } from '@src/models/skillMatrixList.model'
import { UserProfileType } from '@src/models/user.model'

export interface SkillMatrixRepositoryInterface {
  getAllSkillMatrix(
    params: SkillMatrixQueryParamsType,
  ): Promise<SkillMatrixList>
  getMineSkillMatrixFormattedReponse(
    uid: string,
  ): Promise<SkillMatrixMineResponseType>
  getAllSkillMatrixFormattedResponse(
    params: SkillMatrixReadParamsType,
  ): Promise<SkillMatrixResponseType>
  saveMineSkillMatrix(
    uid: string,
    userProfile: UserProfileType,
    skillMatrixUpdateParams: SkillMatrixUpdateParamsType,
  ): Promise<void>
  updateSkillMatrixOfUser(
    skillMatrixUpdateOfUserParams: SkillMatrixUpdateOfUserParamsType,
  ): Promise<void>
}
