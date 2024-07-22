import {
  AttributeValue,
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { ReportRepositoryInterface } from '@src/core/Report/repository/ReportRepositoryInterface'
import { ProductivityReportReadParamWithCompanyType } from '@src/core/Report/model/productivity.model'
import { getTableName } from '@src/core/db/TableName'
import { TimeEntryRowType } from '@src/core/TimeEntry/model/timeEntry.model'

export class ReportRepository implements ReportRepositoryInterface {
  constructor(private dynamoDBClient: DynamoDBClient) {}

  async getProductivityReport(
    params: ProductivityReportReadParamWithCompanyType,
    uids: { email: string }[],
  ): Promise<TimeEntryRowType[]> {
    const command = new QueryCommand({
      TableName: getTableName('TimeEntry'),
      IndexName: 'companyIndex',
      KeyConditionExpression:
        'company = :company AND timeEntryDate BETWEEN :from AND :to',
      ExpressionAttributeValues: {
        ':company': { S: params.company },
        ':from': { S: params.from },
        ':to': { S: params.to },
      },
    })
    const result = await this.dynamoDBClient.send(command)
    return (
      result.Items?.map((item) => {
        return this.getFilteredTimeEntry(item, params, uids)
      }).flat() ?? []
    )
  }

  async getProjectTypes(
    company: string,
  ): Promise<{ project: string; projectType: string }[]> {
    const command = new QueryCommand({
      TableName: getTableName('Task'),
      KeyConditionExpression: 'company = :company',
      ExpressionAttributeValues: {
        ':company': { S: company },
      },
    })
    const result = await this.dynamoDBClient.send(command)
    return (
      result.Items?.map((task) => ({
        project: task.customerProject?.S?.split('#')[1] ?? '',
        projectType: task.projectType?.S ?? '',
      })).sort() ?? []
    )
  }

  private getFilteredTimeEntry(
    item: Record<string, AttributeValue>,
    params: ProductivityReportReadParamWithCompanyType,
    uids: { email: string }[],
  ): TimeEntryRowType[] {
    const resultForCompany: TimeEntryRowType[] = []

    item.tasks?.SS?.forEach((taskItem) => {
      const [customer, project, task, hours] = taskItem.split('#')
      resultForCompany.push({
        user: item.uid?.S ?? '',
        date: item.timeEntryDate?.S ?? '',
        company: item.company?.S ?? '',
        customer: customer,
        project: project,
        task: task,
        hours: parseFloat(hours),
        description: item.description?.S ?? '',
        startHour: item.startHour?.S ?? '',
        endHour: item.endHour?.S ?? '',
      })
    })
    return resultForCompany.filter((result) => {
      if (params.customer) {
        if (params.project) {
          if (params.task && params.name) {
            return (
              result.customer === params.customer &&
              result.project === params.project &&
              result.task === params.task &&
              uids.some((uid) => uid.email === result.user)
            )
          }

          if (params.task) {
            return (
              result.customer === params.customer &&
              result.project === params.project &&
              result.task === params.task
            )
          }

          if (params.name) {
            return (
              result.customer === params.customer &&
              result.project === params.project &&
              uids.some((uid) => uid.email === result.user)
            )
          }

          return (
            result.customer === params.customer &&
            result.project === params.project
          )
        }

        if (params.name) {
          return (
            result.customer === params.customer &&
            uids.some((uid) => uid.email === result.user)
          )
        }

        return result.customer === params.customer
      }

      if (params.name) {
        return uids.some((uid) => uid.email === result.user)
      }

      return resultForCompany
    })
  }
}
