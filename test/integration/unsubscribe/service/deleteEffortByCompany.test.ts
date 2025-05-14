import { test, before, after } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { ScanCommand } from '@aws-sdk/client-dynamodb'
import { getTableName } from '@src/core/db/TableName'
import { PrismaClient } from 'prisma/generated'
import { UserProfileService } from '@src/core/User/service/UserProfileService'
import { UserProfileRepository } from '@src/infrastructure/User/repository/UserProfileRepository'
import { DynamoDBConnection } from '@src/infrastructure/db/DynamoDBConnection'
import { EffortService } from '@src/core/Effort/service/EffortService'
import { EffortRepository } from '@src/infrastructure/Effort/repository/EffortRepository'

let app: FastifyInstance
const prisma = new PrismaClient()

let effortService: EffortService
before(async () => {
    app = createApp({ logger: false })
    await app.ready()
    const dynamo = DynamoDBConnection.getClient()
    const userRepository = new UserProfileRepository(dynamo)
    const userProfileService = new UserProfileService(userRepository)
    const effortRepository = new EffortRepository(dynamo, true)
    effortService = new EffortService(effortRepository, userProfileService)
})

after(async () => {
    await prisma.$disconnect()
    await app.close()
})

test('Delete skill matrix of a company', async (t) => {
    await effortService.deleteEffortByCompany("it")
    const result = await app.dynamoDBClient.send(
        new ScanCommand({
            TableName: getTableName('Effort'),
        }),
    )

    t.equal(result.Items?.length, 2)
})
