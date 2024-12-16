import { test, before, after } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { PrismaClient } from '../../../prisma/generated'
import { QueryCommand } from '@aws-sdk/client-dynamodb'
import { getTableName } from '@src/core/db/TableName'

let app: FastifyInstance
const prisma = new PrismaClient()

function getToken(): string {
  return app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it',
    role: 'ADMIN',
  })
}

before(async () => {
  app = createApp({ logger: false })
  await app.ready()
})

after(async () => {
  await prisma.$disconnect()
  await app.close()
})

test('Reactivate user without authentication', async (t) => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/user/reactivate-user/george.python@email.com`,
  })
  t.equal(response.statusCode, 401)
})

test('Reactivate user without ADMIN ROLE', async (t) => {
  const tempToken = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it',
  })

  const response = await app.inject({
    method: 'POST',
    url: `/api/user/reactivate-user/george.python@email.com`,
    headers: {
      authorization: `Bearer ${tempToken}`,
    },
  })
  t.equal(response.statusCode, 403)
})

test('Reactivate user', async (t) => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/user/reactivate-user/george.python@email.com`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(response.statusCode, 204)

  const result = await app.dynamoDBClient.send(
    new QueryCommand({
      TableName: getTableName('UserProfile'),
      KeyConditionExpression: 'uid = :uid',
      ExpressionAttributeValues: { ':uid': { S: 'george.python@email.com' } },
    }),
  )

  const disabledUser = result.Items![0]
  t.equal(disabledUser.disabled.BOOL, false)
  t.notOk(disabledUser.disabledAt.S)
})
