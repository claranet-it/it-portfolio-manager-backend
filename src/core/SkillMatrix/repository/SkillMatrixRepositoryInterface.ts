import {
  SkillMatrixMineResponseType,
  SkillMatrixQueryParamsType,
  SkillMatrixReadParamsType,
  SkillMatrixResponseType,
  SkillMatrixUpdateOfUserParamsType,
  SkillMatrixUpdateParamsType,
} from '@src/core/SkillMatrix/model/skillMatrix.model'
import { SkillMatrixList } from '@src/core/SkillMatrix/model/skillMatrixList.model'
import { UserProfileType } from '@src/core/User/model/user.model'

export interface SkillMatrixRepositoryInterface {
  getAllSkillMatrix(
    params: SkillMatrixQueryParamsType,
  ): Promise<SkillMatrixList>
  getMineSkillMatrixFormattedResponse(
    uid: string,
  ): Promise<SkillMatrixMineResponseType>
  getAllSkillMatrixFormattedResponse(
    params: SkillMatrixReadParamsType,
  ): Promise<SkillMatrixResponseType>
  save(
    uid: string,
    userProfile: UserProfileType,
    skillMatrixUpdateParams: SkillMatrixUpdateParamsType,
  ): Promise<void>
  updateSkillMatrixOfUser(
    skillMatrixUpdateOfUserParams: SkillMatrixUpdateOfUserParamsType,
  ): Promise<void>
  delete(uid: string): Promise<void>
}
