import {
  SkillMatrixMineResponseType,
  SkillMatrixResponsePerUidType,
  SkillMatrixResponseType,
  SkillMatrixRowType,
  SkillMatrixSkillsType,
} from '@src/core/SkillMatrix/model/skillMatrix.model'
import { skillsList } from '@src/core/Configuration/service/ConfigurationService'
import { getNameByEmail } from '@src/helpers/email.helper'

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
        const name =
          skillMatrixRow.name !== ''
            ? skillMatrixRow.name
            : getNameByEmail(skillMatrixRow.uid)
        let skillMatrixRowPerUid = skillMatrixList.find(
          (skillMatrixRowPerUid: SkillMatrixResponsePerUidType) => {
            return skillMatrixRowPerUid[name]
          },
        )

        if (!skillMatrixRowPerUid) {
          const skillsDefault: SkillMatrixSkillsType = {}
          skillsList.map((skill: string) => {
            skillsDefault[skill] = 0
          })

          skillMatrixRowPerUid = {
            [name]: {
              company: skillMatrixRow.company,
              crew: skillMatrixRow.crew,
              skills: skillsDefault,
            },
          }

          skillMatrixList.push(skillMatrixRowPerUid)
        }

        skillMatrixRowPerUid[name].skills[skillMatrixRow.skill] =
          skillMatrixRow.score
        return skillMatrixList
      },
      [],
    )
  }
}
