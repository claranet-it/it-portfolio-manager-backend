import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import { SkillMatrixUpdateParamsType } from '@models/skillMatrix.model'
import { JwtTokenType } from '@src/models/jwtToken.model'
import { PutItemCommand } from '@aws-sdk/client-dynamodb'
import { UserProfileNotInitializedError } from '@src/core/customExceptions/UserProfileNotInitializedError'

declare module 'fastify' {
  interface FastifyInstance {
    saveMineSkillMatrix: (
      jwtToken: JwtTokenType,
      skillMatrixUpdateParams: SkillMatrixUpdateParamsType,
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

  fastify.decorate('saveMineSkillMatrix', saveMineSkillMatrix)
}

export default fp(saveSkillMatrixPlugin)
