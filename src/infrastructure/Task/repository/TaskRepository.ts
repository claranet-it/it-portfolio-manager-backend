import {
  AttributeValue,
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import { getTableName } from '@src/core/db/TableName'
import {
  ProjectReadParamsType,
  ProjectRowType,
} from '@src/core/Task/model/task.model'

export class TaskRepository implements TaskRepositoryInterface {
  constructor(private dynamoDBClient: DynamoDBClient) {}
  
  async getCustomers(company: string): Promise<string[]> {
    const command = new QueryCommand({
      TableName: getTableName('Projects'),
      IndexName: 'companyIndex',
      KeyConditionExpression: 'company = :company',
      ExpressionAttributeValues: { ':company': { S: company} },
    })
    const result = await this.dynamoDBClient.send(command)
    return result.Items?.map((item) => item.customer?.S ?? '') ?? []
  }

  async get(params: ProjectReadParamsType): Promise<ProjectRowType[]> {
    const command = new QueryCommand({
      TableName: getTableName('Projects'),
      IndexName: 'companyIndex',
      KeyConditionExpression: 'company = :company',
      ExpressionAttributeValues: { ':company': { S: params.company } },
    })
    const result = await this.dynamoDBClient.send(command)
    if (result?.Items) {
      return result.Items.map((item) => this.getProjectRowFromDynamoItem(item))
    }

    return []
  }

  async getByUid(uid: string): Promise<ProjectRowType | null> {
    const command = new QueryCommand({
      TableName: getTableName('Projects'),
      KeyConditionExpression: 'uid = :uid',
      ExpressionAttributeValues: { ':uid': { S: uid } },
    })

    const result = await this.dynamoDBClient.send(command)
    if (
      result?.Items?.length === 1 &&
      (result?.Items[0]?.crew?.S || result?.Items[0]?.company?.S)
    ) {
      return this.getProjectRowFromDynamoItem(result.Items[0])
    }

    return null
  }

  private getProjectRowFromDynamoItem(
    item: Record<string, AttributeValue>,
  ): ProjectRowType {
    return {
      uid: item.uid?.S ?? '',
      name: item.name?.S ?? '',
      category: item.category?.S ?? '',
      company: item.company?.S ?? '',
    }
  }
}
