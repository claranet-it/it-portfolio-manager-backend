import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import {
  SkillMatrixUpdateOfUserParamsType,
  SkillMatrixUpdateParamsType,
} from '@models/skillMatrix.model'
import { JwtTokenType } from '@src/models/jwtToken.model'
import {
  PutItemCommand,
  TransactWriteItemsCommand,
  TransactWriteItemsCommandInput,
} from '@aws-sdk/client-dynamodb'
import { UserProfileNotInitializedError } from '@src/core/customExceptions/UserProfileNotInitializedError'

declare module 'fastify' {
  interface FastifyInstance {
    saveMineSkillMatrix: (
      jwtToken: JwtTokenType,
      skillMatrixUpdateParams: SkillMatrixUpdateParamsType,
    ) => Promise<void>
    updateSkillMatrixOfUser: (
      skillMatrixUpdateOfUserParams: SkillMatrixUpdateOfUserParamsType,
    ) => Promise<void>
  }
}

async function saveSkillMatrixPlugin(fastify: FastifyInstance): Promise<void> {
  const saveMineSkillMatrix = async (
    jwtToken: JwtTokenType,
    skillMatrixUpdateParams: SkillMatrixUpdateParamsType,
  ): Promise<void> => {
    const userProfile = await fastify.getUserProfile(jwtToken.email)
    if (!userProfile) {
      throw new UserProfileNotInitializedError()
    }

    const item = {
      uid: { S: jwtToken.email },
      company: { S: userProfile.company },
      crew: { S: userProfile.crew },
      skill: { S: skillMatrixUpdateParams.skill },
      score: { N: skillMatrixUpdateParams.score.toString() },
      updatedAt: { S: new Date().toISOString() },
    }
    const putItemCommand = new PutItemCommand({
      TableName: fastify.getTableName('SkillMatrix'),
      Item: item,
    })
    await fastify.dynamoDBClient.send(putItemCommand)
  }
  const updateSkillMatrixOfUser = async (
    skillMatrixUpdateOfUserParams: SkillMatrixUpdateOfUserParamsType,
  ): Promise<void> => {
    if (
      skillMatrixUpdateOfUserParams.crew ||
      skillMatrixUpdateOfUserParams.company
    ) {
      const uid = skillMatrixUpdateOfUserParams.uid
      const skillMatrixList = await fastify.getAllSkillMatrix({ uid })

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
                TableName: fastify.getTableName('SkillMatrix'),
                UpdateExpression: 'SET #company = :company, #crew = :crew',
                ExpressionAttributeNames: {
                  '#company': 'company',
                  '#crew': 'crew',
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
                },
              },
            })),
        }

        const command = new TransactWriteItemsCommand(input)
        await fastify.dynamoDBClient.send(command)
      }
    }
  }

  fastify.decorate('saveMineSkillMatrix', saveMineSkillMatrix)
  fastify.decorate('updateSkillMatrixOfUser', updateSkillMatrixOfUser)
}

export default fp(saveSkillMatrixPlugin)
