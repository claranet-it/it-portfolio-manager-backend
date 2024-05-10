import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb'
import {
  ProjectReadParamsType,
  TaskReadParamType,
} from '@src/core/Task/model/task.model'
import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import { getTableName } from '@src/core/db/TableName'

export class TaskRepository implements TaskRepositoryInterface {
  constructor(private dynamoDBClient: DynamoDBClient) {}

  async getCustomers(company: string): Promise<string[]> {
    const command = new QueryCommand({
      TableName: getTableName('Task'),
      IndexName: 'companyIndex',
      KeyConditionExpression: 'company = :company',
      ExpressionAttributeValues: { ':company': { S: company } },
    })
    const result = await this.dynamoDBClient.send(command)
    return Array.from(
      new Set(result.Items?.map((item) => item.customer?.S ?? '') ?? []),
    ).sort()
  }

  async getProjects(params: ProjectReadParamsType): Promise<string[]> {
    const command = new QueryCommand({
      TableName: getTableName('Task'),
      IndexName: 'companyIndex',
      KeyConditionExpression: 'company = :company and customer = :customer',
      ExpressionAttributeValues: {
        ':company': { S: params.company },
        ':customer': { S: params.customer },
      },
    })
    const result = await this.dynamoDBClient.send(command)
    return result.Items?.map((item) => item.project?.S ?? '') ?? []
  }

  async getTasks(params: TaskReadParamType): Promise<string[]> {
    const command = new QueryCommand({
      TableName: getTableName('Task'),
      IndexName: 'companyIndex',
      KeyConditionExpression: 'company = :company and customer = :customer',
      ExpressionAttributeValues: {
        ':company': { S: params.company },
        ':customer': { S: params.customer },
      },
    })
    const result = await this.dynamoDBClient.send(command)
    return (
      result.Items?.find((item) => item.project?.S === params.project)?.tasks
        ?.SS ?? []
    )
  }
}
