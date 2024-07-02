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
  CnaReadParamType,
  TimeEntryRowWithProjectType,
} from '@src/core/TimeEntry/model/timeEntry.model'
import { TimeEntryRepositoryInterface } from '@src/core/TimeEntry/repository/TimeEntryRepositoryIntereface'
import { getTableName } from '@src/core/db/TableName'
import { ProjectType } from '@src/core/Report/model/productivity.model'

export class TimeEntryRepository implements TimeEntryRepositoryInterface {
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

  async findTimeOffForCna(
    params: CnaReadParamType,
  ): Promise<TimeEntryRowWithProjectType[]> {
    const { from, to } = this.getPeriodFromMonthAndYear(
      params.month,
      params.year,
    )

    const users = []
    if (params.company === 'flowing') {
      users.push(
        'stefania.ceccacci@claranet.com',
        'manuel.gherardi@claranet.com',
      )
    } else if (params.company === 'claranet') {
      users.push('micol.panetta@claranet.com', 'emanuele.laera@claranet.com')
    } else if (params.company === 'test') {
      users.push('micol.ts@email.com', 'nicholas.crow@email.com')
    }

    const results = []
    for (const user of users) {
      const command = new QueryCommand({
        TableName: getTableName('TimeEntry'),
        KeyConditionExpression:
          'uid = :uid AND timeEntryDate BETWEEN :from AND :to',
        ExpressionAttributeValues: {
          ':uid': { S: user },
          ':from': { S: from },
          ':to': { S: to },
        },
      })
      const result = await this.dynamoDBClient.send(command)
      if (result.Items) {
        results.push(result.Items)
      }
    }
    return results.length > 0
      ? results
          .flat(2)
          .map((result) => {
            return this.getTimeOff(result)
          })
          .flat() ?? []
      : []
  }

  async saveMine(params: TimeEntryRowType): Promise<void> {
    await this.delete(params)
    const command = new UpdateItemCommand({
      TableName: getTableName('TimeEntry'),
      Key: {
        uid: { S: params.user },
        timeEntryDate: { S: params.date },
      },
      UpdateExpression: 'SET company = :company ADD tasks :task',
      ExpressionAttributeValues: {
        ':company': { S: params.company },
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
        company: item.company?.S ?? '',
        customer: customer,
        project: project,
        task: task,
        hours: parseFloat(hours),
      })
    })
    return resultForUser
  }

  private getTimeOff(
    item: Record<string, AttributeValue>,
  ): TimeEntryRowWithProjectType[] {
    const resultForUser: TimeEntryRowWithProjectType[] = []
    item.tasks?.SS?.forEach((taskItem) => {
      const [customer, project, task, hours] = taskItem.split('#')
      resultForUser.push({
        user: item.uid?.S ?? '',
        date: item.timeEntryDate?.S ?? '',
        company: item.company?.S ?? '',
        customer: customer,
        project: project,
        projectType: ProjectType.NON_BILLABLE,
        task: task,
        hours: parseFloat(hours),
        timeEntryDate: item.timeEntryDate?.S ?? '',
      })
    })
    return resultForUser.filter((result) => result.project === 'Assenze')
  }

  private getPeriodFromMonthAndYear(month: number, year: number) {
    if (month < 1 || month > 12) {
      throw new Error('Month must be between 1 and 12')
    }

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    startDate.setDate(startDate.getDate() + 1)
    endDate.setDate(endDate.getDate() + 1)

    const from = startDate.toISOString().split('T')[0]
    const to = endDate.toISOString().split('T')[0]

    return { from, to }
  }
}
