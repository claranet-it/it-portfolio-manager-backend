import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb'
import { UserProfileRepositoryInterface } from '@src/core/User/repository/UserProfileRepositoryInterface'
import { getTableName } from '@src/core/db/TableName'
import {
  UserProfileType,
  UserProfileWithUidType,
} from '@src/core/User/model/user.model'

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
        name: result.Items[0].name?.S ?? '',
        crew: result.Items[0].crew?.S ?? '',
        company: result.Items[0].company?.S ?? '',
      }
    }

    return null
  }

  async saveUserProfile(
    uid: string,
    { name, crew, company }: UserProfileType,
  ): Promise<void> {
    const item = {
      uid: { S: uid },
      name: { S: name },
      crew: { S: crew },
      company: { S: company },
    }
    const putItemCommand = new PutItemCommand({
      TableName: getTableName('UserProfile'),
      Item: item,
    })
    await this.dynamoDBClient.send(putItemCommand)
  }

  async getAllUserProfiles(): Promise<UserProfileWithUidType[]> {
    const command = new ScanCommand({
      TableName: getTableName('UserProfile'),
    })
    const result = await this.dynamoDBClient.send(command)
    if (result?.Items) {
      return result.Items.map((item) => ({
        uid: item.uid?.S ?? '',
        crew: item.crew?.S ?? '',
        company: item.company?.S ?? '',
        name: item.name?.S ?? ''
      }))
    }

    return []
  }
}
