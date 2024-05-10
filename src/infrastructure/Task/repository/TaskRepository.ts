import {
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import { getTableName } from '@src/core/db/TableName'

export class TaskRepository implements TaskRepositoryInterface {
  constructor(private dynamoDBClient: DynamoDBClient) {}
  
  async getCustomers(company: string): Promise<string[]> {
    const command = new QueryCommand({
      TableName: getTableName('Task'),
      IndexName: 'companyIndex',
      KeyConditionExpression: 'company = :company',
      ExpressionAttributeValues: { ':company': { S: company} },
    })
    const result = await this.dynamoDBClient.send(command)
    return Array.from(new Set(result.Items?.map((item) => item.customer?.S ?? '') ?? [])).sort()
  }
}
