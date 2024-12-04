import {
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { CompanyRepositoryInterface } from '@src/core/Company/repository/CompanyRepositoryInterface'
import {
  CompanyFindType,
  CompanyType,
} from '@src/core/Company/repository/model/Company'
import { getTableName } from '@src/core/db/TableName'

export class CompanyRepository implements CompanyRepositoryInterface {
  constructor(private dynamoDBClient: DynamoDBClient) {}

  async findById(id: string): Promise<CompanyType | null> {
    const command = new GetItemCommand({
      TableName: getTableName('Company'),
      Key: {
        domain: { S: id },
      },
    })
    const result = await this.dynamoDBClient.send(command)
    if (result.Item) {
      return {
        id: result.Item.domain.S ?? '',
        name: result.Item.name.S ?? '',
      }
    }
    return null
  }

  async findOne(find: CompanyFindType): Promise<CompanyType | null> {
    const command = new QueryCommand({
      TableName: getTableName('Company'),
      IndexName: 'NameIndex',
      KeyConditionExpression: '#name = :nameToFind',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':nameToFind': { S: find.name },
      },
    })

    const result = await this.dynamoDBClient.send(command)
    if (result && result.Items) {
      return {
        id: result.Items[0].domain.S ?? '',
        name: result.Items[0].name.S ?? '',
      }
    }
    return null
  }
}
