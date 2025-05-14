import { test, before, after } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { ScanCommand } from '@aws-sdk/client-dynamodb'
import { getTableName } from '@src/core/db/TableName'
import { PrismaClient } from 'prisma/generated'
import { UserProfileService } from '@src/core/User/service/UserProfileService'
import { UserProfileRepository } from '@src/infrastructure/User/repository/UserProfileRepository'
import { DynamoDBConnection } from '@src/infrastructure/db/DynamoDBConnection'
import { SkillMatrixService } from '@src/core/SkillMatrix/service/SkillMatrixService'
import { SkillMatrixRepository } from '@src/infrastructure/SkillMatrix/repository/SkillMatrixRepository'

let app: FastifyInstance
const prisma = new PrismaClient()

let skillMatrixService: SkillMatrixService
before(async () => {
    app = createApp({ logger: false })
    await app.ready()
    const dynamo = DynamoDBConnection.getClient()
    const userRepository = new UserProfileRepository(dynamo)
    const userProfileService = new UserProfileService(userRepository)
    const skillMatrixRepository = new SkillMatrixRepository(dynamo)
    skillMatrixService = new SkillMatrixService(skillMatrixRepository, userProfileService)
})

after(async () => {
    await prisma.$disconnect()
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
