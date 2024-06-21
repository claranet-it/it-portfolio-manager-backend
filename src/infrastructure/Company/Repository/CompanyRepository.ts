import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import { CompanyRepositoryInterface } from '@src/core/Company/repository/CompanyRepositoryInterface'
import { CompanyType } from '@src/core/Company/repository/model/Company'
import { getTableName } from '@src/core/db/TableName'

export class CompanyRepository implements CompanyRepositoryInterface {
  constructor(private dynamoDBClient: DynamoDBClient) {}

  async findById(id: string): Promise<CompanyType | null> {
    const command = new GetItemCommand({
      TableName: getTableName('Company'),
      Key: {
        id: { S: id },
      },
    })
    const result = await this.dynamoDBClient.send(command)
    if (result.Item) {
      return {
        id: result.Item.id.S ?? '',
        name: result.Item.name.S ?? '',
      }
    }
    return null
  }
}
