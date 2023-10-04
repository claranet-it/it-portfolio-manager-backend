import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import { UserProfileType } from '@models/user.model'
import { PutItemCommand } from '@aws-sdk/client-dynamodb'

declare module 'fastify' {
  interface FastifyInstance {
    saveUserProfile: (
      uid: string,
      userProfileData: UserProfileType,
    ) => Promise<void>
  }
}

async function saveUserProfilePlugin(fastify: FastifyInstance): Promise<void> {
  const saveUserProfile = async (
    uid: string,
    { crew }: UserProfileType,
  ): Promise<void> => {
    const item = {
      uid: { S: uid },
      crew: { S: crew },
    }
    const putItemCommand = new PutItemCommand({
      TableName: fastify.getTableName('UserProfile'),
      Item: item,
    })
    await fastify.dynamoDBClient.send(putItemCommand)
  }

  fastify.decorate('saveUserProfile', saveUserProfile)
}

export default fp(saveUserProfilePlugin)
