import {
  SkillMatrixMineResponseType,
  SkillMatrixResponsePerUidType,
  SkillMatrixResponseType,
  SkillMatrixRowType,
  SkillMatrixSkillsType,
} from '@models/skillMatrix.model'
import { skillsList } from '@src/features/configuration/getAllConfiguration.plugin'

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

  toSkillMatrixResponse(): SkillMatrixResponseType {
    return this.skillMatrixList.reduce(
      (
        skillMatrixList: SkillMatrixResponseType,
        skillMatrixRow: SkillMatrixRowType,
      ) => {
        const skillMatrixRowPerUid = skillMatrixList.find(
          (skillMatrixRowPerUid: SkillMatrixResponsePerUidType) => {
            return skillMatrixRowPerUid[skillMatrixRow.uid]
          },
        )

        if (skillMatrixRowPerUid) {
          skillMatrixRowPerUid[skillMatrixRow.uid].skills[
            skillMatrixRow.skill
          ] = skillMatrixRow.score
        } else {
          const skillsDefault: SkillMatrixSkillsType = {}
          skillsList.map((skill: string) => {
            skillsDefault[skill] = 0
          })
          skillsDefault[skillMatrixRow.skill] = skillMatrixRow.score

          skillMatrixList.push({
            [skillMatrixRow.uid]: {
              company: skillMatrixRow.company,
              crew: skillMatrixRow.crew,
              skills: skillsDefault,
            },
          })
        }

        return skillMatrixList
      },
      [],
    )
  }
}
