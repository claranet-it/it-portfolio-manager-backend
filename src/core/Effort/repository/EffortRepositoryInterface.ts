import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { EffortRowType, GetEffortParamsType } from '../model/effort'

export interface EffortRepositoryInterface {
  getEffort(params: GetEffortParamsType): Promise<EffortRowType[]>

  saveEffort(params: EffortRowType): Promise<void>

  delete(uid: string): Promise<void>

  getData(): Promise<Record<string, AttributeValue>[] | undefined>

  restoreData(item: Record<string, AttributeValue>): Promise<void>
}
