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
        const name =
        effortRow.name !== ''
          ? effortRow.name
          : this.getNameByEmail(effortRow.uid)
        let effortRowPerUid = effortList.find(
          (effortRowPerUid: EffortResponsePerUidType) => {
            return effortRowPerUid[name]
          },
        )

        if (!effortRowPerUid) {
          effortRowPerUid = {
            [name]: {
            crew: effortRow.crew,
            company: effortRow.company,
             effort: []
            },
          }
          effortList.push(effortRowPerUid)
        }

        effortRowPerUid[name].effort.push({
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
  private getNameByEmail(email: string): string {
    console.log(email);
    return email
      .substring(0, email.indexOf('@'))
      .split('.')
      .map((name) => name.charAt(0).toUpperCase() + name.slice(1))
      .join(' ')
  }
}
