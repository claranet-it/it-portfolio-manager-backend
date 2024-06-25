import {AttributeValue, DynamoDBClient, QueryCommand} from '@aws-sdk/client-dynamodb'
import {ReportRepositoryInterface} from '@src/core/Report/repository/ReportRepositoryInterface'
import {
    ProductivityReportReadParamWithCompanyType,
} from '@src/core/Report/model/productivity.model'
import {getTableName} from "@src/core/db/TableName";
import {TimeEntryRowType} from "@src/core/TimeEntry/model/timeEntry.model";

export class ReportRepository implements ReportRepositoryInterface {
    constructor(private dynamoDBClient: DynamoDBClient) {
    }

    async getProductivityReport(
        params: ProductivityReportReadParamWithCompanyType,
    ): Promise<TimeEntryRowType[]> {
        const command = new QueryCommand({
            TableName: getTableName('TimeEntry'),
            IndexName: 'companyIndex',
            KeyConditionExpression:
                'company = :company AND timeEntryDate BETWEEN :from AND :to',
            ExpressionAttributeValues: {
                ':company': {S: params.company},
                ':from': {S: params.from},
                ':to': {S: params.to},
            },
        })
        const result = await this.dynamoDBClient.send(command)
        return (
            result.Items?.map((item) => {
                return this.getTimeEntryFromDynamoDb(item)
            }).flat() ?? []
        )
    }

    async getProjectTypes(company: string): Promise<{project: string, projectType: string}[]> {
        const command = new QueryCommand({
            TableName: getTableName('Task'),
            KeyConditionExpression:
                'company = :company',
            ExpressionAttributeValues: {
                ':company': {S: company},
            },
        })
        const result = await this.dynamoDBClient.send(command)
        return (
            result.Items?.map(
                (task) => ({
                    project: task.customerProject?.S?.split('#')[1] ?? '',
                    projectType: task.projectType?.S ?? ''
                }),
            ).sort() ?? []
        )
    }

    private getTimeEntryFromDynamoDb(
        item: Record<string, AttributeValue>,
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
            })
        })
        return resultForCompany
    }
}

/*[
  {
    user: {
      email: 'micol.panetta@it.clara.net',
      name: 'Micol Panetta',
      picture: 'https://test.com/micol.pic.jpg',
    },
    workedHours: 40,
    totalTracked: {
      billableProductivity: 60,
      nonBillableProductivity: 10,
      slackTime: 20,
      absence: 10,
    },
    totalProductivity: 70,
  },
  {
    user: {
      email: 'mauro.monteneri@it.clara.net',
      name: 'Mauro Monteneri',
      picture: 'https://test.com/mauro.pic.jpg',
    },
    workedHours: 40,
    totalTracked: {
      billableProductivity: 70,
      nonBillableProductivity: 0,
      slackTime: 10,
      absence: 20,
    },
    totalProductivity: 70,
  },
]*/

