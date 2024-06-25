import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { ReportRepositoryInterface } from '@src/core/Report/repository/ReportRepositoryInterface'
import { ProductivityReportResponseType } from '@src/core/Report/model/productivity.model'
import { TimeEntryReadParamWithUserType } from '@src/core/TimeEntry/model/timeEntry.model'

export class ReportRepository implements ReportRepositoryInterface {
  constructor(private dynamoDBClient: DynamoDBClient) {}

  async getProductivityReport(
    params: TimeEntryReadParamWithUserType,
  ): Promise<ProductivityReportResponseType> {
    return [
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
    ]
  }
}
