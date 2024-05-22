import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb'
import {
  TimeEntryReadParamWithUserType,
  TimeEntryRowType,
  deleteTimeEntryWithUserType,
} from '@src/core/TimeEntry/model/timeEntry.model'
import { TimeEntryRepositoryInterface } from '@src/core/TimeEntry/repository/TimeEntryRepositoryIntereface'
import { getTableName } from '@src/core/db/TableName'

export class TimeEntryRepostiroy implements TimeEntryRepositoryInterface {
  constructor(private dynamoDBClient: DynamoDBClient) {}

  async find(
    params: TimeEntryReadParamWithUserType,
  ): Promise<TimeEntryRowType[]> {
    const command = new QueryCommand({
      TableName: getTableName('TimeEntry'),
      KeyConditionExpression:
        'uid = :uid AND timeEntryDate BETWEEN :from AND :to',
      ExpressionAttributeValues: {
        ':uid': { S: params.user },
        ':from': { S: params.from },
        ':to': { S: params.to },
      },
    })
    const result = await this.dynamoDBClient.send(command)
    return (
      result.Items?.map((item) => {
        return this.getTimeEntryFromDynamoDb(item)
      }).flat() ?? []
    )
  }

  async saveMine(params: TimeEntryRowType): Promise<void> {
    await this.delete(params)
    const command = new UpdateItemCommand({
      TableName: getTableName('TimeEntry'),
      Key: {
        uid: { S: params.user },
        timeEntryDate: { S: params.date },
      },
      UpdateExpression: 'ADD tasks :task',
      ExpressionAttributeValues: {
        ':task': {
          SS: [
            `${params.customer}#${params.project}#${params.task}#${params.hours}`,
          ],
        },
      },
    })
    await this.dynamoDBClient.send(command)
  }

  async delete(params: deleteTimeEntryWithUserType): Promise<void> {
    const getItemCommand = new GetItemCommand({
      TableName: getTableName('TimeEntry'),
      Key: {
        uid: { S: params.user },
        timeEntryDate: { S: params.date },
      },
    })
    const timeEntry = await this.dynamoDBClient.send(getItemCommand)
    const task = timeEntry.Item?.tasks?.SS?.find((task) =>
      task.startsWith(`${params.customer}#${params.project}#${params.task}`),
    )
    if (task) {
      const updateCommand = new UpdateItemCommand({
        TableName: getTableName('TimeEntry'),
        Key: {
          uid: { S: params.user },
          timeEntryDate: { S: params.date },
        },
        UpdateExpression: 'DELETE tasks :task',
        ExpressionAttributeValues: {
          ':task': {
            SS: [task],
          },
        },
      })
      await this.dynamoDBClient.send(updateCommand)
    }
  }

  private getTimeEntryFromDynamoDb(
    item: Record<string, AttributeValue>,
  ): TimeEntryRowType[] {
    const resultForUser: TimeEntryRowType[] = []
    item.tasks?.SS?.forEach((taskItem) => {
      const [customer, project, task, hours] = taskItem.split('#')
      resultForUser.push({
        user: item.uid?.S ?? '',
        date: item.timeEntryDate?.S ?? '',
        customer: customer,
        project: project,
        task: task,
        hours: parseFloat(hours),
      })
    })
    return resultForUser
  }
}
