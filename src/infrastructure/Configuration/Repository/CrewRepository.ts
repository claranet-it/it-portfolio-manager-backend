import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb'
import { ConfigurationCrewsType } from '@src/core/Configuration/model/configuration.model'
import { CrewRepositoryInterface } from '@src/core/Configuration/repository/CrewRepositoryInterface'
import { getTableName } from '@src/core/db/TableName'

export class CrewRepository implements CrewRepositoryInterface {
  constructor(private dynamoDBClient: DynamoDBClient) {}

  async findByCompany(company: string): Promise<ConfigurationCrewsType> {
    const command = new QueryCommand({
      TableName: getTableName('Crew'),
      KeyConditionExpression: 'company = :company',
      ExpressionAttributeValues: {
        ':company': { S: company },
      },
    })
    const result = await this.dynamoDBClient.send(command)
    return (
      result?.Items?.map((item) => ({
        name: item.name?.S ?? '',
        service_line: item.serviceLine?.S ?? '',
      })).sort((a, b) => a.name.localeCompare(b.name)) ?? []
    )
  }
}
