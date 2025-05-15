import { FastifyInstance } from 'fastify'
import { test, before, after } from 'tap'
import createApp from '@src/app'
import { PrismaClient } from '../../../prisma/generated'
import { unsubscribe } from '@test/utils/unsubscribe'
import { seedCompany } from '@test/seed/prisma/company'
import { seedSkill } from '@test/seed/prisma/skill'
import { seedCompanyConnections } from '@test/seed/prisma/companyConnections'
import { ScanCommand } from '@aws-sdk/client-dynamodb'
import { getTableName } from '@src/core/db/TableName'

let app: FastifyInstance
const prisma = new PrismaClient()

const FAKE_EMAIL = 'TEST_USUBSCRIBE@email.com'

before(async () => {
    app = createApp({ logger: false })
    await app.ready()
    await seedCompany()
    await seedSkill()
    await seedCompanyConnections()
})

after(async () => {
    const deleteCompany = prisma.company.deleteMany()
    const deleteSkill = prisma.skill.deleteMany()
    const deleteConnections = prisma.companyConnections.deleteMany()

    await prisma.$transaction([
        deleteConnections, deleteSkill, deleteCompany
    ])
    prisma.$disconnect()
    await app.close()
})

test('should return 401 deleting without authentication', async (t) => {
    const response = await app.inject({
        method: 'DELETE',
        url: '/api/unsubscribe/id',
    })
    t.equal(response.statusCode, 401)
})

test('should return 500 deleting not existing company', async (t) => {
    const token = app.createTestJwt({
        email: FAKE_EMAIL,
        name: 'Marytex',
        picture: 'https://test.com/marytex.jpg',
        company: 'it',
        role: 'ADMIN',
    })

    const response = await unsubscribe(app, token, "not_valid_id")

    t.equal(response.statusCode, 404)
})

test('should return 403 deleting other company', async (t) => {
    const token = app.createTestJwt({
        email: FAKE_EMAIL,
        name: 'Marytex',
        picture: 'https://test.com/marytex.jpg',
        company: 'OtherCompany',
        role: 'ADMIN',
    })

    const it = await prisma.company.findFirst({ where: { name: 'it' } })
    if (it) {
        const response = await unsubscribe(app, token, it.id)
        t.equal(response.statusCode, 403)
    }

})

test('should return 403 deleting company without ADMIN role', async (t) => {
    const token = app.createTestJwt({
        email: FAKE_EMAIL,
        name: 'Marytex',
        picture: 'https://test.com/marytex.jpg',
        company: 'it',
        role: 'USER',
    })

    const it = await prisma.company.findFirst({ where: { name: 'it' } })
    if (it) {
        const response = await unsubscribe(app, token, it.id)
        t.equal(response.statusCode, 403)
    }

})

test('should delete all data of company', async (t) => {

    const token = app.createTestJwt({
        email: FAKE_EMAIL,
        name: 'Marytex',
        picture: 'https://test.com/marytex.jpg',
        company: 'it',
        role: 'SUPERADMIN',
    })

    const it = await prisma.company.findFirst({ where: { name: 'it' } })
    if (it) {
        const response = await unsubscribe(app, token, it.id)
        t.equal(response.statusCode, 200)
        const company = await prisma.company.findMany()
        const skill = await prisma.skill.findMany()
        const companyConnections = await prisma.companyConnections.findMany()
        const user = await app.dynamoDBClient.send(
            new ScanCommand({
                TableName: getTableName('UserProfile'),
            }),
        )

        t.equal(company.length, 3)
        t.equal(skill.length, 1)
        t.equal(companyConnections.length, 0)
        t.equal(user.Items?.length, 5)
    }
})

