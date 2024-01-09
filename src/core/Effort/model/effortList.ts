import {
  EffortResponsePerUidType,
  EffortResponseType,
  EffortRowType,
} from './effort'

export class EffortList {
  private effortList: EffortRowType[]

  constructor(effortList: EffortRowType[]) {
    this.effortList = effortList
  }

  getEffortList(): EffortRowType[] {
    return this.effortList
  }

  pushEffort(effort: EffortRowType): void {
    this.effortList.push(effort)
  }

  toEffortReponse(): EffortResponseType {
    return this.effortList.reduce(
      (effortList: EffortResponseType, effortRow: EffortRowType) => {
        let effortRowPerUid = effortList.find(
          (effortRowPerUid: EffortResponsePerUidType) => {
            return effortRowPerUid[effortRow.uid]
          },
        )

        if (!effortRowPerUid) {
          effortRowPerUid = {
            [effortRow.uid]: [],
          }
          effortList.push(effortRowPerUid)
        }

        effortRowPerUid[effortRow.uid].push({
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
