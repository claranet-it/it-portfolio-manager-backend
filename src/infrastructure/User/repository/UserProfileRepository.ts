import {
  AttributeValue,
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb'
import { UserProfileRepositoryInterface } from '@src/core/User/repository/UserProfileRepositoryInterface'
import { getTableName } from '@src/core/db/TableName'
import {
  CompleteUserProfileType,
  UpdateUserProfileType,
  UserProfileType,
} from '@src/core/User/model/user.model'
import { flowingUsers } from '@src/core/Configuration/service/ConfigurationService'

export class UserProfileRepository implements UserProfileRepositoryInterface {
  constructor(private dynamoDBClient: DynamoDBClient) {}

  async getUserProfile(
    uid: string,
    company: string | undefined,
  ): Promise<UserProfileType | null> {
    const command = new QueryCommand({
      TableName: getTableName('UserProfile'),
      KeyConditionExpression: 'uid = :uid',
      ExpressionAttributeValues: { ':uid': { S: uid } },
    })

    const result = await this.dynamoDBClient.send(command)

    if (!result.Items || result.Items.length == 0 || result.Items.length > 1) {
      return null
    }

    const userProfile = result.Items[0]

    if (userProfile.crew?.S || userProfile.company?.S) {
      if (userProfile.company?.S != company) {
        // Avoid to query for people on different company
        return null
      }
      // TODO: (crew || company) or (crew && company) ?
      return this.getCompleteUserProfileFromDynamoItem(result.Items[0])
    }

    return null
  }

  async getCompleteUserProfile(
    uid: string,
  ): Promise<CompleteUserProfileType | null> {
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
      return this.getCompleteUserProfileFromDynamoItem(result.Items[0])
    }

    return null
  }

  async saveUserProfile(
    uid: string,
    name: string,
    company: string,
    picture: string,
    userProfile: UpdateUserProfileType,
  ): Promise<void> {
    const item = {
      uid: { S: uid },
      name: { S: name },
      crew: { S: userProfile.crew },
      company: { S: company },
      picture: { S: picture },
      crewLeader: { BOOL: userProfile.crewLeader || false },
      place: { S: userProfile.place || '' },
      workingExperience: { S: userProfile.workingExperience || '' },
      education: { S: userProfile.education || '' },
      certifications: { S: userProfile.certifications || '' },
    }
    const putItemCommand = new PutItemCommand({
      TableName: getTableName('UserProfile'),
      Item: item,
    })
    await this.dynamoDBClient.send(putItemCommand)
  }

  async getAllUserProfiles(): Promise<CompleteUserProfileType[]> {
    const command = new ScanCommand({
      TableName: getTableName('UserProfile'),
    })
    const result = await this.dynamoDBClient.send(command)
    if (result?.Items) {
      return result.Items.map((item) =>
        this.getCompleteUserProfileFromDynamoItem(item),
      )
    }

    return []
  }

  async getAllActiveUserProfiles(): Promise<CompleteUserProfileType[]> {
    const command = new ScanCommand({
      TableName: getTableName('UserProfile'),
      FilterExpression:
        'disabled = :disabled OR attribute_not_exists(disabled)',
      ExpressionAttributeValues: { ':disabled': { BOOL: false } },
    })
    const result = await this.dynamoDBClient.send(command)
    if (result?.Items) {
      return result.Items.map((item) =>
        this.getCompleteUserProfileFromDynamoItem(item),
      )
    }

    return []
  }

  async getClaranetUserProfiles(): Promise<CompleteUserProfileType[]> {
    const command = new QueryCommand({
      TableName: getTableName('UserProfile'),
      IndexName: 'companyIndex',
      KeyConditionExpression: 'company = :company',
      ExpressionAttributeValues: { ':company': { S: 'it' } },
    })
    const result = await this.dynamoDBClient.send(command)
    if (result?.Items) {
      return result.Items.map((item) =>
        this.getCompleteUserProfileFromDynamoItem(item),
      ).filter((profile) => !flowingUsers.includes(profile.uid))
    }

    return []
  }

  async getFlowingUserProfiles(): Promise<CompleteUserProfileType[]> {
    const users = []
    for (const uid of flowingUsers) {
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
        users.push(this.getCompleteUserProfileFromDynamoItem(result.Items[0]))
      }
    }
    return users
  }

  async getByCompany(company: string): Promise<CompleteUserProfileType[]> {
    const command = new QueryCommand({
      TableName: getTableName('UserProfile'),
      IndexName: 'companyIndex',
      KeyConditionExpression: 'company = :company',
      ExpressionAttributeValues: { ':company': { S: company } },
    })
    const result = await this.dynamoDBClient.send(command)
    if (result?.Items) {
      return result.Items.map((item) =>
        this.getCompleteUserProfileFromDynamoItem(item),
      )
    }

    return []
  }

  async getByName(name: string, company: string): Promise<{ email: string }[]> {
    const command = new QueryCommand({
      TableName: getTableName('UserProfile'),
      IndexName: 'companyIndex',
      KeyConditionExpression: 'company = :company',
      FilterExpression: 'contains(#name, :name)',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':company': { S: company },
        ':name': { S: name },
      },
    })
    const result = await this.dynamoDBClient.send(command)
    if (result?.Items) {
      return result.Items.map((item) => {
        return { email: item.uid?.S ?? '' }
      })
    }
    return []
  }

  async delete(uid: string): Promise<void> {
    const command = new UpdateItemCommand({
      TableName: getTableName('UserProfile'),
      Key: { uid: { S: uid } },
      UpdateExpression: 'SET disabled = :disabled, disabledAt = :disabledAt',
      ExpressionAttributeValues: {
        ':disabled': {
          BOOL: true,
        },
        ':disabledAt': {
          S: new Date().toUTCString(),
        },
      },
    })
    const response = await this.dynamoDBClient.send(command)
    console.warn(response)
  }

  async getDisabled(company: string): Promise<CompleteUserProfileType[]> {
    const command = new QueryCommand({
      TableName: getTableName('UserProfile'),
      IndexName: 'companyIndex',
      KeyConditionExpression: 'company = :company',
      FilterExpression: 'disabled = :disabled',
      ExpressionAttributeValues: {
        ':company': { S: company },
        ':disabled': { BOOL: true },
      },
    })
    const result = await this.dynamoDBClient.send(command)
    if (result?.Items) {
      return result.Items.map((item) =>
        this.getCompleteUserProfileFromDynamoItem(item),
      )
    }

    return []
  }

  async getRole(uid: string): Promise<string> {
    const command = new QueryCommand({
      TableName: getTableName('UserProfile'),
      KeyConditionExpression: 'uid = :uid',
      ExpressionAttributeValues: {
        ':uid': { S: uid },
      },
    })
    const result = await this.dynamoDBClient.send(command)
    if (result?.Items && result.Items.length == 1) {
      return result.Items[0]?.role?.S ?? ''
    }

    return ''
  }

  private getCompleteUserProfileFromDynamoItem(
    item: Record<string, AttributeValue>,
  ): CompleteUserProfileType {
    return {
      uid: item.uid?.S ?? '',
      picture: item.picture?.S ?? '',
      crew: item.crew?.S ?? '',
      company: item.company?.S ?? '',
      name: item.name?.S ?? '',
      crewLeader: item.crewLeader?.BOOL ?? false,
      place: item.place?.S ?? '',
      workingExperience: item.workingExperience?.S ?? '',
      education: item.education?.S ?? '',
      certifications: item.certifications?.S ?? '',
      disabled: item.disabled?.BOOL ?? false,
    }
  }
}
