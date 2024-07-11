import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

export class DynamoDBConnection {
  static getClient(): DynamoDBClient {
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
}
