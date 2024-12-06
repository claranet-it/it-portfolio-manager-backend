import {
  BatchWriteItemCommand,
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  TransactWriteItemsCommand,
  TransactWriteItemsCommandInput,
  WriteRequest,
} from '@aws-sdk/client-dynamodb'
import { SkillMatrixRepositoryInterface } from '@src/core/SkillMatrix/repository/SkillMatrixRepositoryInterface'
import { getTableName } from '@src/core/db/TableName'
import {
  SkillMatrixMineResponseType,
  SkillMatrixQueryParamsType,
  SkillMatrixReadParamsType,
  SkillMatrixResponseType,
  SkillMatrixUpdateOfUserParamsType,
  SkillMatrixUpdateParamsType,
} from '@src/core/SkillMatrix/model/skillMatrix.model'
import { SkillMatrixList } from '@src/core/SkillMatrix/model/skillMatrixList.model'
import { UserProfileType } from '@src/core/User/model/user.model'

export class SkillMatrixRepository implements SkillMatrixRepositoryInterface {
  constructor(private dynamoDBClient: DynamoDBClient) {}

  async getAllSkillMatrix(
    params: SkillMatrixQueryParamsType,
  ): Promise<SkillMatrixList> {
    return await this.getSkillMatrix(params)
  }

  async getMineSkillMatrixFormattedResponse(
    uid: string,
  ): Promise<SkillMatrixMineResponseType> {
    const skillMatrixList = await this.getSkillMatrix({ uid: uid })
    return skillMatrixList.toSkilMatrixMineResponse()
  }

  async getAllSkillMatrixFormattedResponse(
    params: SkillMatrixReadParamsType,
  ): Promise<SkillMatrixResponseType> {
    const skillMatrixList = await this.getSkillMatrix(params)
    return skillMatrixList.toSkillMatrixResponse()
  }

  async save(
    uid: string,
    userProfile: UserProfileType,
    skillMatrixUpdateParams: SkillMatrixUpdateParamsType,
  ): Promise<void> {
    const item = {
      uid: { S: uid },
      company: { S: userProfile.company },
      crew: { S: userProfile.crew },
      name: { S: userProfile.name },
      skill: { S: skillMatrixUpdateParams.skill },
      score: { N: skillMatrixUpdateParams.score.toString() },
      updatedAt: { S: new Date().toISOString() },
    }

    const putItemCommand = new PutItemCommand({
      TableName: getTableName('SkillMatrix'),
      Item: item,
    })

    await this.dynamoDBClient.send(putItemCommand)
  }

  async updateSkillMatrixOfUser(
    skillMatrixUpdateOfUserParams: SkillMatrixUpdateOfUserParamsType,
  ): Promise<void> {
    if (
      skillMatrixUpdateOfUserParams.crew ||
      skillMatrixUpdateOfUserParams.company
    ) {
      const uid = skillMatrixUpdateOfUserParams.uid
      const skillMatrixList = await this.getAllSkillMatrix({ uid })

      if (skillMatrixList.getSkillMatrixList().length > 0) {
        const input: TransactWriteItemsCommandInput = {
          TransactItems: skillMatrixList
            .getSkillMatrixList()
            .map((skillMatrix) => ({
              Update: {
                Key: {
                  uid: { S: uid },
                  skill: { S: skillMatrix.skill },
                },
                TableName: getTableName('SkillMatrix'),
                UpdateExpression:
                  'SET #company = :company, #crew = :crew, #name= :name',
                ExpressionAttributeNames: {
                  '#company': 'company',
                  '#crew': 'crew',
                  '#name': 'name',
                },
                ExpressionAttributeValues: {
                  ':company': {
                    S:
                      skillMatrixUpdateOfUserParams.company ||
                      skillMatrix.company,
                  },
                  ':crew': {
                    S: skillMatrixUpdateOfUserParams.crew || skillMatrix.crew,
                  },
                  ':name': {
                    S: skillMatrixUpdateOfUserParams.name || skillMatrix.name,
                  },
                },
              },
            })),
        }

        const command = new TransactWriteItemsCommand(input)
        await this.dynamoDBClient.send(command)
      }
    }
  }

  private async getSkillMatrix(
    params: SkillMatrixQueryParamsType,
  ): Promise<SkillMatrixList> {
    const command = new QueryCommand({
      TableName: getTableName('SkillMatrix'),
    })

    if (params.uid) {
      command.input.KeyConditionExpression = 'uid = :uid'
      command.input.ExpressionAttributeValues = { ':uid': { S: params.uid } }
    } else if (params.company) {
      command.input.IndexName = 'companyIndex'
      command.input.KeyConditionExpression = 'company = :company'
      command.input.ExpressionAttributeValues = {
        ':company': { S: params.company },
      }
    }

    const result = await this.dynamoDBClient.send(command)

    if (result?.Items) {
      return new SkillMatrixList(
        result.Items.map((item) => ({
          uid: item.uid?.S ?? '',
          company: item.company?.S ?? '',
          name: item.name?.S ?? '',
          crew: item.crew?.S ?? '',
          skill: item.skill?.S ?? '',
          skillCategory: item.skillCategory?.S ?? '',
          score: parseInt(item.score?.N ?? '0'),
          updatedAt: item.updatedAt?.S ?? '',
        })),
      )
    }

    return new SkillMatrixList([])
  }

  async delete(uid: string): Promise<void> {
    const skillMatrixPerUid = await this.getSkillMatrix({ uid: uid })
    const deleteRequests: WriteRequest[] = []
    skillMatrixPerUid.getSkillMatrixList().forEach((skillMatrix) => {
      deleteRequests.push({
        DeleteRequest: {
          Key: { uid: { S: skillMatrix.uid }, skill: { S: skillMatrix.skill } },
        },
      })
    })
    if (deleteRequests.length) {
      const requestItems: Record<string, WriteRequest[]> = {}
      requestItems[getTableName('SkillMatrix')] = deleteRequests
      const command = new BatchWriteItemCommand({ RequestItems: requestItems })
      await this.dynamoDBClient.send(command)
    }
  }
}
