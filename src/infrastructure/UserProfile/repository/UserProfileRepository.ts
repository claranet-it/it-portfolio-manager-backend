import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb'
import { UserProfileRepositoryInterface } from '@src/core/UserProfile/repository/UserProfileRepositoryInterface'
import { getTableName } from '@src/core/db/TableName'
import { UserProfileType } from '@src/models/user.model'

export class UserProfileRepository implements UserProfileRepositoryInterface {
  constructor(private dynamoDBClient: DynamoDBClient) {}

  async getUserProfile(uid: string): Promise<UserProfileType | null> {
    const command = new QueryCommand({
      TableName: getTableName('UserProfile'),
      KeyConditionExpression: 'uid = :uid',
      ExpressionAttributeValues: { ':uid': { S: uid } },
    })

    const result = await this.dynamoDBClient.send(command)
    if (
      result?.Items?.length === 1 &&
      (result?.Items[0]?.crew?.S || result?.Items[0]?.company?.S)
    ) {
      // TODO: (crew || company) or (crew && company) ?
      return {
        crew: result.Items[0].crew?.S ?? '',
        company: result.Items[0].company?.S ?? '',
      }
    }

    return null
  }
}
