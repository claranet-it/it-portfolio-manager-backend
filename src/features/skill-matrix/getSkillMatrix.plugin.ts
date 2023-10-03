import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import { SkillMatrixType } from '@models/skillMatrix.model'
import { QueryCommand } from '@aws-sdk/client-dynamodb'

declare module 'fastify' {
  interface FastifyInstance {
    getSkillMatrix: (uid: string) => Promise<SkillMatrixType>
  }
}

async function getSkillMatrixPlugin(fastify: FastifyInstance): Promise<void> {
  const getSkillMatrix = async (uid: string): Promise<SkillMatrixType> => {
    const command = new QueryCommand({
      TableName: fastify.getTableName('SkillMatrix'),
      KeyConditionExpression: 'uid = :uid',
      ExpressionAttributeValues: { ':uid': { S: uid } },
    })

    const result = await fastify.dynamoDBClient.send(command)

    if (!result?.Items) {
      return []
    }
    return result.Items.map((item) => ({
      uid: item.uid?.S ?? '',
      company: item.company?.S ?? '',
      crew: item.crew?.S ?? '',
      skill: item.skill?.S ?? '',
      score: parseInt(item.score?.N ?? '0'),
      updatedAt: item.updatedAt?.S ?? '',
    }))
  }

  fastify.decorate('getSkillMatrix', getSkillMatrix)
}

export default fp(getSkillMatrixPlugin)
