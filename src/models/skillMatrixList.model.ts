import {
  SkillMatrixMineResponseType,
  SkillMatrixRowType,
} from '@models/skillMatrix.model'

export class SkillMatrixList {
  private skillMatrixList: SkillMatrixRowType[]

  constructor(skillMatrixList: SkillMatrixRowType[]) {
    this.skillMatrixList = skillMatrixList
  }

  getSkillMatrixList(): SkillMatrixRowType[] {
    return this.skillMatrixList
  }

  toSkilMatrixMineResponse(): SkillMatrixMineResponseType {
    return this.skillMatrixList
  }
}
