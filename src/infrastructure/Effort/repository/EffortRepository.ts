import {
  DynamoDBClient,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb'
import { EffortReadParamsType } from '@src/core/Effort/model/effort'
import { EffortList } from '@src/core/Effort/model/effortList'
import { EffortRepositoryInterface } from '@src/core/Effort/repository/EffortRepositoryInterface'
import { getTableName } from '@src/core/db/TableName'

export class EffortRepository implements EffortRepositoryInterface {
  constructor(private dynamoDBClient: DynamoDBClient) {}

  async getEffort(params: EffortReadParamsType): Promise<EffortList> {
    let command = null
    if (params.uid) {
      command = this.createQueryCommand(params)
    } else {
      command = this.createScanCommand()
    }

    const result = await this.dynamoDBClient.send(command)

    if (result?.Items) {
      return new EffortList(
        result.Items.map((item) => ({
          uid: item.uid?.S ?? '',
          month_year: item.month_year?.S ?? '',
          confirmedEffort: item.confirmedEffort.N
            ? Number(item.confirmedEffort.N)
            : 0,
          tentativeEffort: item.tentativeEffort.N
            ? Number(item.tentativeEffort.N)
            : 0,
          notes: item.notes?.S ?? '',
        })),
      )
    }

    return new EffortList([])
  }

  createQueryCommand(params: EffortReadParamsType): QueryCommand {
    const command = new QueryCommand({
      TableName: getTableName('Effort'),
    })

    if (params.uid) {
      command.input.KeyConditionExpression = 'uid = :uid'
      command.input.ExpressionAttributeValues = { ':uid': { S: params.uid } }
    }

    return command
  }

  createScanCommand(): ScanCommand {
    return new ScanCommand({
      TableName: getTableName('Effort'),
    })
  }
}
