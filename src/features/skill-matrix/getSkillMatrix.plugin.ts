import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import { SkillMatrixQueryParamsType, SkillMatrixType } from '@models/skillMatrix.model'
import { QueryCommand } from '@aws-sdk/client-dynamodb'
import { JwtTokenType } from '@src/models/jwtToken.model'

declare module 'fastify' {
  interface FastifyInstance {
    getMineSkillMatrix: (jwtToken: JwtTokenType) => Promise<SkillMatrixType>
  }
}

async function getSkillMatrixPlugin(fastify: FastifyInstance): Promise<void> {
  const getSkillMatrix = async (params: SkillMatrixQueryParamsType): Promise<SkillMatrixType> => {
    const command = new QueryCommand({TableName: fastify.getTableName('SkillMatrix')})
    command.input.KeyConditionExpression = 'uid = :uid'
    command.input.ExpressionAttributeValues = { ':uid': { S: params.uid } }

    const result = await fastify.dynamoDBClient.send(command)

    if (result?.Items) {
      return result.Items.map((item) => ({
        uid: item.uid?.S ?? '',
        company: item.company?.S ?? '',
        crew: item.crew?.S ?? '',
        skill: item.skill?.S ?? '',
        score: parseInt(item.score?.N ?? '0'),
        updatedAt: item.updatedAt?.S ?? '',
      }))
    }

    return []
  }
  const getMineSkillMatrix = async (jwtToken: JwtTokenType): Promise<SkillMatrixType> => {
    return await getSkillMatrix({ uid: jwtToken.email })
  }

  fastify.decorate('getMineSkillMatrix', getMineSkillMatrix)
}

export default fp(getSkillMatrixPlugin)
