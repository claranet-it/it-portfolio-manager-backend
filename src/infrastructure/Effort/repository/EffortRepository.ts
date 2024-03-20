import {
  BatchWriteItemCommand,
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
  WriteRequest,
} from '@aws-sdk/client-dynamodb'
import {
  EffortRowType,
  GetEffortParamsType,
} from '@src/core/Effort/model/effort'
import { EffortRepositoryInterface } from '@src/core/Effort/repository/EffortRepositoryInterface'
import { getTableName } from '@src/core/db/TableName'

export class EffortRepository implements EffortRepositoryInterface {
  constructor(
    private dynamoDBClient: DynamoDBClient,
    private isTest: boolean,
  ) {}

  async getEffort(params: GetEffortParamsType): Promise<EffortRowType[]> {
    let command = null
    if (params.uid) {
      command = this.createQueryCommand(params)
    } else {
      command = this.createScanCommand()
    }

    const result = await this.dynamoDBClient.send(command)

    if (result?.Items) {
      return result.Items.map((item) => ({
        uid: item.uid?.S ?? '',
        month_year: item.month_year?.S ?? '',
        confirmedEffort: item.confirmedEffort.N
          ? Number(item.confirmedEffort.N)
          : 0,
        tentativeEffort: item.tentativeEffort.N
          ? Number(item.tentativeEffort.N)
          : 0,
        notes: item.notes?.S ?? '',
      }))
    }

    return []
  }

  async saveEffort(params: EffortRowType): Promise<void> {
    const command = new PutItemCommand({
      TableName: getTableName('Effort'),
      Item: {
        uid: { S: params.uid },
        month_year: { S: params.month_year },
        confirmedEffort: { N: params.confirmedEffort.toString() },
        tentativeEffort: { N: params.tentativeEffort.toString() },
        notes: { S: params.notes },
      },
    })

    if (!this.isTest) {
      await this.dynamoDBClient.send(command)
    }
  }

  async delete(uid: string): Promise<void> {
    const effortsPerUid = await this.getEffort({ uid: uid })
    const deleteRequests: WriteRequest[] = []
    effortsPerUid.forEach((effort) => {
      deleteRequests.push({
        DeleteRequest: {
          Key: { uid: { S: effort.uid }, month_year: { S: effort.month_year } },
        },
      })
    })
    if (deleteRequests.length) {
      const requestItems: Record<string, WriteRequest[]> = {}
      requestItems[getTableName('Effort')] = deleteRequests
      const command = new BatchWriteItemCommand({ RequestItems: requestItems })
      await this.dynamoDBClient.send(command)
    }
  }

  createQueryCommand(params: GetEffortParamsType): QueryCommand {
    const command = new QueryCommand({
      TableName: getTableName('Effort'),
    })

    if (params.uid) {
      command.input.KeyConditionExpression = 'uid = :uid'
      command.input.ExpressionAttributeValues = { ':uid': { S: params.uid } }
      if (params.month_year) {
        command.input.KeyConditionExpression += ' AND month_year = :month_year'
        command.input.ExpressionAttributeValues[':month_year'] = {
          S: params.month_year,
        }
      }
    }

    return command
  }

  createScanCommand(): ScanCommand {
    return new ScanCommand({
      TableName: getTableName('Effort'),
    })
  }
}
