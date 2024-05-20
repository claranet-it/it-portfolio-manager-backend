import {
  AttributeValue,
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb'
import {
  TimeEntryReadParamWithUserType,
  TimeEntryRowType,
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
    const exisingItem = await this.findByUserAndDate(params.user, params.date)
    if (exisingItem.length > 0) {
      this.insertTaskInExistingDay(params)
    } else {
      this.createNewDay(params)
    }
  }

  private async findByUserAndDate(
    user: string,
    date: string,
  ): Promise<TimeEntryRowType[]> {
    const command = new QueryCommand({
      TableName: getTableName('TimeEntry'),
      KeyConditionExpression: 'uid =  :user AND timeEntryDate = :date',
      ExpressionAttributeValues: {
        ':user': { S: user },
        ':date': { S: date },
      },
    })
    const result = await this.dynamoDBClient.send(command)
    return (
      result.Items?.map((item) => this.getTimeEntryFromDynamoDb(item)).flat() ??
      []
    )
  }

  private async insertTaskInExistingDay(params: TimeEntryRowType) {
    const command = new UpdateItemCommand({
      TableName: getTableName('TimeEntry'),
      Key: {
        uid: { S: params.user },
        timeEntryDate: { S: params.date },
      },
      UpdateExpression: 'SET tasks = list_append(tasks, :task)',
      ExpressionAttributeValues: {
        ':task': {
          L: [
            {
              M: {
                customer: { S: params.customer },
                project: { S: params.project },
                task: { S: params.task },
                hours: { N: params.hours.toString() },
              },
            },
          ],
        },
      },
    })
    await this.dynamoDBClient.send(command)
  }

  private async createNewDay(params: TimeEntryRowType) {
    const command = new PutItemCommand({
      TableName: getTableName('TimeEntry'),
      Item: {
        uid: { S: params.user },
        timeEntryDate: { S: params.date },
        tasks: {
          L: [
            {
              M: {
                customer: { S: params.customer },
                project: { S: params.project },
                task: { S: params.task },
                hours: { N: params.hours.toString() },
              },
            },
          ],
        },
      },
    })
    await this.dynamoDBClient.send(command)
  }

  private getTimeEntryFromDynamoDb(
    item: Record<string, AttributeValue>,
  ): TimeEntryRowType[] {
    const resultForUser: TimeEntryRowType[] = []
    item.tasks?.L?.forEach((task) => {
      resultForUser.push({
        user: item.uid?.S ?? '',
        date: item.timeEntryDate?.S ?? '',
        customer: task.M?.customer?.S ?? '',
        project: task.M?.project?.S ?? '',
        task: task.M?.task?.S ?? '',
        hours: parseFloat(task.M?.hours?.N ?? '0'),
      })
    })
    return resultForUser
  }
}