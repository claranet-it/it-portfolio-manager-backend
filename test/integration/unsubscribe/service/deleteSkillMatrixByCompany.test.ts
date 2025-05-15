import { test, before, after } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { PutItemCommand, ScanCommand, ScanCommandOutput } from '@aws-sdk/client-dynamodb'
import { getTableName } from '@src/core/db/TableName'
import { UserProfileService } from '@src/core/User/service/UserProfileService'
import { UserProfileRepository } from '@src/infrastructure/User/repository/UserProfileRepository'
import { DynamoDBConnection } from '@src/infrastructure/db/DynamoDBConnection'
import { SkillMatrixService } from '@src/core/SkillMatrix/service/SkillMatrixService'
import { SkillMatrixRepository } from '@src/infrastructure/SkillMatrix/repository/SkillMatrixRepository'

let app: FastifyInstance

let skillMatrixService: SkillMatrixService
let originalSeed: ScanCommandOutput

before(async () => {
    app = createApp({ logger: false })
    await app.ready()
    const dynamo = DynamoDBConnection.getClient()
    const userRepository = new UserProfileRepository(dynamo)
    const userProfileService = new UserProfileService(userRepository)
    const skillMatrixRepository = new SkillMatrixRepository(dynamo)
    skillMatrixService = new SkillMatrixService(skillMatrixRepository, userProfileService)
    originalSeed = await app.dynamoDBClient.send(
        new ScanCommand({
            TableName: getTableName('SkillMatrix'),
        }),
    )

})

after(async () => {
    if (originalSeed?.Items) {
        for (const item of originalSeed.Items) {
            await app.dynamoDBClient.send(
                new PutItemCommand({
                    TableName: getTableName('SkillMatrix'),
                    Item: item,
                })
            );
        }
    }

    await app.close()
})

test('Delete skill matrix of a company', async (t) => {
    await skillMatrixService.deleteSkillMatrixByCompany("it")
    const result = await app.dynamoDBClient.send(
        new ScanCommand({
            TableName: getTableName('SkillMatrix'),
        }),
    )

    t.equal(result.Items?.length, 3)
})
