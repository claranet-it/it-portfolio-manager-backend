import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import { JwtTokenType } from '@models/jwtToken.model'
import { UserProfileType, UserWithProfileType } from '@models/user.model'
import { QueryCommand } from '@aws-sdk/client-dynamodb'

declare module 'fastify' {
  interface FastifyInstance {
    getCurrentUser: (jwtToken: JwtTokenType) => Promise<UserWithProfileType>
  }
}

async function getCurrentUserPlugin(fastify: FastifyInstance): Promise<void> {
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

  const getCurrentUser = async (
    jwtToken: JwtTokenType,
  ): Promise<UserWithProfileType> => {
    const userProfile = await getUserProfile(jwtToken.email)
    if (!userProfile) {
      return {
        ...jwtToken,
      }
    }
    return {
      ...jwtToken,
      crew: userProfile.crew,
    }
  }

  fastify.decorate('getCurrentUser', getCurrentUser)
}

export default fp(getCurrentUserPlugin)
