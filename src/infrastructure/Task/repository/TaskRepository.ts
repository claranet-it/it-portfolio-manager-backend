import {
  DynamoDBClient,
  QueryCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb'
import {
  ProjectReadParamsType,
  TaskCreateParamType,
  TaskReadParamType,
} from '@src/core/Task/model/task.model'
import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'
import { InvalidCharacterError } from '@src/core/customExceptions/InvalidCharacterError'
import { getTableName } from '@src/core/db/TableName'

export class TaskRepository implements TaskRepositoryInterface {
  constructor(private dynamoDBClient: DynamoDBClient) {}

  async getCustomers(company: string): Promise<string[]> {
    const command = new QueryCommand({
      TableName: getTableName('Task'),
      KeyConditionExpression: 'company = :company',
      ExpressionAttributeValues: { ':company': { S: company } },
    })
    const result = await this.dynamoDBClient.send(command)
    return Array.from(
      new Set(
        result.Items?.map(
          (item) => item.customerProject?.S?.split('#')[0] ?? '',
        ) ?? [],
      ),
    ).sort()
  }

  async getProjects(params: ProjectReadParamsType): Promise<string[]> {
    const command = new QueryCommand({
      TableName: getTableName('Task'),
      KeyConditionExpression:
        'company = :company and begins_with(customerProject, :customer)',
      ExpressionAttributeValues: {
        ':company': { S: params.company },
        ':customer': { S: params.customer },
      },
    })
    const result = await this.dynamoDBClient.send(command)
    return (
      result.Items?.map(
        (item) => item.customerProject?.S?.split('#')[1] ?? '',
      ).sort() ?? []
    )
  }

  async getTasks(params: TaskReadParamType): Promise<string[]> {
    const command = new QueryCommand({
      TableName: getTableName('Task'),
      KeyConditionExpression:
        'company = :company and customerProject = :customerProject',
      ExpressionAttributeValues: {
        ':company': { S: params.company },
        ':customerProject': { S: `${params.customer}#${params.project}` },
      },
    })
    const result = await this.dynamoDBClient.send(command)
    return (
      result.Items?.map((item) => item.tasks?.SS ?? [])
        .flat()
        .sort() ?? []
    )
  }

  async createTask(params: TaskCreateParamType): Promise<void> {
    const company = params.company
    const project = params.project
    const customer = params.customer
    const task = params.task
    if (customer.includes('#') || project.includes('#')) {
      throw new InvalidCharacterError(
        '# is not a valid character for customer or project',
      )
    }
    const customerProject = `${customer}#${project}`
    const updateParams = {
      TableName: getTableName('Task'),
      Key: {
        customerProject: { S: customerProject },
        company: { S: company },
      },
      UpdateExpression: 'ADD tasks :task',
      ExpressionAttributeValues: {
        ':task': {
          SS: [task],
        },
      },
    }
    await this.dynamoDBClient.send(new UpdateItemCommand(updateParams))
  }
}
