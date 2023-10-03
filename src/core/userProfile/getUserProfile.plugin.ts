import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import { UserProfileType } from '@models/user.model'
import { QueryCommand } from '@aws-sdk/client-dynamodb'

declare module 'fastify' {
  interface FastifyInstance {
    getUserProfile: (uid: string) => Promise<UserProfileType | null>
  }
}

async function getUserProfilePlugin(fastify: FastifyInstance): Promise<void> {
  const getUserProfile = async (
    uid: string,
  ): Promise<UserProfileType | null> => {
    const command = new QueryCommand({
      TableName: fastify.getTableName('UserProfile'),
      KeyConditionExpression: 'uid = :uid',
      ExpressionAttributeValues: { ':uid': { S: uid } },
    })
    const result = await fastify.dynamoDBClient.send(command)
    if (result?.Items?.length === 1 && result?.Items[0]?.crew?.S) {
      return {
        crew: result.Items[0].crew?.S ?? '',
      }
    }
    return null
  }

  fastify.decorate('getUserProfile', getUserProfile)
}

export default fp(getUserProfilePlugin)
