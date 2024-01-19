import { getNameByEmail } from '@src/helpers/email.helper'
import {
  EffortResponsePerUidType,
  EffortResponseType,
  EffortWithUserProfileType,
} from './effort'

export class EffortList {
  private effortList: EffortWithUserProfileType[]

  constructor(effortList: EffortWithUserProfileType[]) {
    this.effortList = effortList
  }

  getEffortList(): EffortWithUserProfileType[] {
    return this.effortList
  }

  pushEffort(effort: EffortWithUserProfileType): void {
    this.effortList.push(effort)
  }

  toEffortReponse(): EffortResponseType {
    return this.effortList.reduce(
      (effortList: EffortResponseType, effortRow: EffortWithUserProfileType) => {
        const name =
        effortRow.name !== ''
          ? effortRow.name
          : getNameByEmail(effortRow.uid)
        let effortRowPerUid = effortList.find(
          (effortRowPerUid: EffortResponsePerUidType) => {
            return effortRowPerUid[effortRow.uid]
          },
        )

        if (!effortRowPerUid) {
          effortRowPerUid = {
            [effortRow.uid]: {
            crew: effortRow.crew,
            company: effortRow.company,
            name: name,
             effort: []
            },
          }
          effortList.push(effortRowPerUid)
        }

        effortRowPerUid[effortRow.uid].effort.push({
          month_year: effortRow.month_year,
          confirmedEffort: effortRow.confirmedEffort,
          tentativeEffort: effortRow.tentativeEffort,
          notes: effortRow.notes,
        })

        return effortList
      },
      [],
    )
  }
}
