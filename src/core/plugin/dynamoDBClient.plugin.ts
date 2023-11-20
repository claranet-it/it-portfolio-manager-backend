import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

declare module 'fastify' {
  interface FastifyInstance {
    dynamoDBClient: DynamoDBClient
  }
}

async function getDynamoDBClientPlugin(
  fastify: FastifyInstance,
): Promise<void> {
  const getDynamoDBClient = (): DynamoDBClient => {
    return fastify.dependencyInjectionContainer().resolve('dynamoDBClient')
  }

  fastify.decorate('dynamoDBClient', getDynamoDBClient())
}

export default fp(getDynamoDBClientPlugin)
