import {
  AttributeValue,
  DeleteItemCommand,
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
  TimeEntryRowWithProjectEntityType,
} from '@src/core/TimeEntry/model/timeEntry.model'
import { TimeEntryRepositoryInterface } from '@src/core/TimeEntry/repository/TimeEntryRepositoryInterface'
import { getTableName } from '@src/core/db/TableName'
import { ProjectType } from '@src/core/Report/model/productivity.model'
import { invariant } from '@src/helpers/invariant'
import { flowingUsers } from '@src/core/Configuration/service/ConfigurationService'
import { TaskRepositoryInterface } from '@src/core/Task/repository/TaskRepositoryInterface'

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

export class TimeEntryRepository implements TimeEntryRepositoryInterface {
  constructor(
    private dynamoDBClient: DynamoDBClient,
    private taskRepository: TaskRepositoryInterface,
  ) {}

  async find(
    params: TimeEntryReadParamWithUserType,
  ): Promise<TimeEntryRowWithProjectEntityType[]> {
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
    const entries = await Promise.all(
      result.Items?.map(async (item) => {
        return await this.getTimeEntryFromDynamoDb(item)
      }).flat() ?? [],
    )
    return entries.flat()
  }

  async findTimeOffForFlowing(
    params: CnaReadParamType,
  ): Promise<TimeEntryRowWithProjectType[]> {
    const { from, to } = this.getPeriodFromMonthAndYear(
      params.month,
      params.year,
    )
    const users = []
    for (const user of flowingUsers) {
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
      users.push(
        result.Items?.map((item) => {
          return this.getTimeOff(item)
        }).flat() ?? [],
      )
    }
    return users.flat()
  }

  async findTimeOffForClaranet(
    params: CnaReadParamType,
  ): Promise<TimeEntryRowWithProjectType[]> {
    const { from, to } = this.getPeriodFromMonthAndYear(
      params.month,
      params.year,
    )
    const command = new QueryCommand({
      TableName: getTableName('TimeEntry'),
      IndexName: 'companyIndex',
      KeyConditionExpression:
        'company = :company AND timeEntryDate BETWEEN :from AND :to',
      ExpressionAttributeValues: {
        ':company': { S: params.company },
        ':from': { S: from },
        ':to': { S: to },
      },
    })

    const result = await this.dynamoDBClient.send(command)
    return (
      result.Items?.map((item) => {
        return this.getTimeOff(item)
      }).flat() ?? []
    ).filter((profile) => !flowingUsers.includes(profile.user))
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
            `${params.customer}#${params.project}#${params.task}#${params.hours}#${params.description ?? ''}#${params.startHour ?? ''}#${params.endHour ?? ''}`,
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

    if (timeEntry.Item?.tasks?.SS) {
      const task = timeEntry.Item.tasks.SS.find((task) =>
        task.startsWith(`${params.customer}#${params.project}#${params.task}`),
      )

      if (task) {
        if (timeEntry.Item?.tasks?.SS?.length > 1) {
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
        } else {
          const deleteCommand = new DeleteItemCommand({
            TableName: getTableName('TimeEntry'),
            Key: {
              uid: { S: params.user },
              timeEntryDate: { S: params.date },
            },
          })
          await this.dynamoDBClient.send(deleteCommand)
        }
      }
    }
  }

  private async getTimeEntryFromDynamoDb(
    item: Record<string, AttributeValue>,
  ): Promise<TimeEntryRowWithProjectEntityType[]> {
    const resultForUser: TimeEntryRowWithProjectEntityType[] = []
    if (item.tasks?.SS) {
      for (const taskItem of item.tasks.SS) {
        const [
          customer,
          project,
          task,
          hours,
          description,
          startHour,
          endHour,
        ] = taskItem.split('#')
        const tasks = await this.taskRepository.getTasksWithProjectType({
          company: item.company?.S ?? '',
          project: project,
          customer: customer,
        })

        resultForUser.push({
          user: item.uid?.S ?? '',
          date: item.timeEntryDate?.S ?? '',
          company: item.company?.S ?? '',
          customer: customer,
          project: { name: project, type: tasks.projectType },
          task: task,
          hours: parseFloat(hours),
          description: description ?? '',
          startHour: startHour ?? '',
          endHour: endHour ?? '',
        })
      }
    }

    return resultForUser
  }

  private getTimeOff(
    item: Record<string, AttributeValue>,
  ): TimeEntryRowWithProjectType[] {
    const resultForCompany: TimeEntryRowWithProjectType[] = []
    item.tasks?.SS?.forEach((taskItem) => {
      const [customer, project, task, hours] = taskItem.split('#')
      resultForCompany.push({
        user: item.uid?.S ?? '',
        date: item.timeEntryDate?.S ?? '',
        company: item.company?.S ?? '',
        customer: customer,
        project: project,
        projectType: ProjectType.ABSENCE,
        task: task,
        hours: parseFloat(hours),
        timeEntryDate: item.timeEntryDate?.S ?? '',
      })
    })
    return resultForCompany.filter(
      (result) => result.project === 'Assenze' && result.task !== 'FESTIVITA',
    )
  }

  private getPeriodFromMonthAndYear(month: number, year: number) {
    invariant(MONTHS.includes(month), 'Month is not valid')
    invariant(year > 0, 'Year is required')

    const firstDayOfMonth = new Date(year, month - 1, 1)
    const lastDayOfMonth = new Date(year, month, 0)

    const fromYear = firstDayOfMonth.getFullYear()
    const fromMonth = firstDayOfMonth.getMonth() + 1
    const fromDay = firstDayOfMonth.getDate()

    const toYear = lastDayOfMonth.getFullYear()
    const toMonth = lastDayOfMonth.getMonth() + 1
    const toDay = lastDayOfMonth.getDate()

    const from = `${fromYear}-${(fromMonth > 9 ? '' : '0') + fromMonth}-${(fromDay > 9 ? '' : '0') + fromDay}`
    const to = `${toYear}-${(toMonth > 9 ? '' : '0') + toMonth}-${(toDay > 9 ? '' : '0') + toDay}`
    return { from, to }
  }
}
