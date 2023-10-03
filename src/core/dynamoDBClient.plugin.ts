import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import * as process from 'process'

declare module 'fastify' {
  interface FastifyInstance {
    dynamoDBClient: DynamoDBClient
  }
}

async function getDynamoDBClientPlugin(
  fastify: FastifyInstance,
): Promise<void> {
  const getDynamoDBClient = (): DynamoDBClient => {
    let dynamoDbClientOptions = {}
    if (process.env.IS_OFFLINE) {
      dynamoDbClientOptions = {
        region: 'localhost',
        endpoint: 'http://0.0.0.0:8000',
        credentials: {
          accessKeyId: 'MockAccessKeyId',
          secretAccessKey: 'MockSecretAccessKey',
        },
      }
    }
    return new DynamoDBClient(dynamoDbClientOptions)
  }

  fastify.decorate('dynamoDBClient', getDynamoDBClient())
}

export default fp(getDynamoDBClientPlugin)
