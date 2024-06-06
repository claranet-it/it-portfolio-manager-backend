import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import { CompanyRepositoryInterface } from '@src/core/Company/repository/CompanyRepositoryInterface'
import { CompanyType } from '@src/core/Company/repository/model/Company'
import { getTableName } from '@src/core/db/TableName'

export class CompanyRepository implements CompanyRepositoryInterface {
  constructor(private dynamoDBClient: DynamoDBClient) {}

  async findByDomain(domain: string): Promise<CompanyType | null> {
    const command = new GetItemCommand({
      TableName: getTableName('Company'),
      Key: {
        domain: { S: domain },
      },
    })
    const result = await this.dynamoDBClient.send(command)
    if (result.Item) {
      return {
        domain: result.Item.domain.S ?? '',
        name: result.Item.name.S ?? '',
      }
    }
    return null
  }
}
