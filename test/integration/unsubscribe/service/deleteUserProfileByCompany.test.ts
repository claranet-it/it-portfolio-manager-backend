import { test, before, after } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { PutItemCommand, ScanCommand, ScanCommandOutput } from '@aws-sdk/client-dynamodb'
import { getTableName } from '@src/core/db/TableName'
import { UserProfileService } from '@src/core/User/service/UserProfileService'
import { UserProfileRepository } from '@src/infrastructure/User/repository/UserProfileRepository'
import { DynamoDBConnection } from '@src/infrastructure/db/DynamoDBConnection'

let app: FastifyInstance

let userProfileService: UserProfileService
let originalSeed: ScanCommandOutput
before(async () => {
    app = createApp({ logger: false })
    await app.ready()
    const dynamo = DynamoDBConnection.getClient()
    const userRepository = new UserProfileRepository(dynamo)
    userProfileService = new UserProfileService(userRepository)

    originalSeed = await app.dynamoDBClient.send(
        new ScanCommand({
            TableName: getTableName('UserProfile'),
        }),
    )
})

after(async () => {
    if (originalSeed?.Items) {
        for (const item of originalSeed.Items) {
            await app.dynamoDBClient.send(
                new PutItemCommand({
                    TableName: getTableName('UserProfile'),
                    Item: item,
                })
            );
        }
    }

    await app.close()
})

test('Delete all users of a company', async (t) => {
    await userProfileService.deleteUsersByCompany("it")
    const result = await app.dynamoDBClient.send(
        new ScanCommand({
            TableName: getTableName('UserProfile'),
        }),
    )
    t.equal(result.Items?.length, 5)
})
