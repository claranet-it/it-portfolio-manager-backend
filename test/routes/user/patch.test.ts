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

test('Patch user without authentication', async (t) => {
  const response = await app.inject({
    method: 'PATCH',
    url: `/api/user/george.python@email.com`,
  })
  t.equal(response.statusCode, 401)
})

test('Patch user without ADMIN ROLE', async (t) => {
  const tempToken = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it',
  })

  const response = await app.inject({
    method: 'PATCH',
    url: `/api/user/george.python@email.com`,
    headers: {
      authorization: `Bearer ${tempToken}`,
    },
    body: {
      crew: 'Moon',
    },
  })
  t.equal(response.statusCode, 403)
})

test('Patch user with ADMIN ROLE and payload.role = ADMIN', async (t) => {
  const response = await app.inject({
    method: 'PATCH',
    url: `/api/user/george.python@email.com`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    body: {
      role: 'ADMIN',
    },
  })
  t.equal(response.statusCode, 403)
})

test('Patch user with SUPERADMIN ROLE and payload.role = ADMIN', async (t) => {
  const tempToken = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it',
    role: 'SUPERADMIN',
  })

  const response = await app.inject({
    method: 'PATCH',
    url: `/api/user/george.python@email.com`,
    headers: {
      authorization: `Bearer ${tempToken}`,
    },
    body: {
      role: 'ADMIN',
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

  const updatedUser = result.Items![0]
  t.equal(updatedUser.role.S, 'ADMIN')
})

test('Patch user with SUPERADMIN ROLE and payload.role = SUPERADMIN', async (t) => {
  const tempToken = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it',
    role: 'SUPERADMIN',
  })

  const response = await app.inject({
    method: 'PATCH',
    url: `/api/user/george.python@email.com`,
    headers: {
      authorization: `Bearer ${tempToken}`,
    },
    body: {
      role: 'SUPERADMIN',
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

  const updatedUser = result.Items![0]
  t.equal(updatedUser.role.S, 'SUPERADMIN')
})

test('Patch user with role TEAM_LEADER', async (t) => {
  const response = await app.inject({
    method: 'PATCH',
    url: `/api/user/george.python@email.com`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    body: {
      crew: 'Moon',
      role: 'TEAM_LEADER',
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

  const updatedUser = result.Items![0]
  t.equal(updatedUser.crew.S, 'Moon')
  t.equal(updatedUser.role.S, 'TEAM_LEADER')
})

test('Patch user with role USER', async (t) => {
  const response = await app.inject({
    method: 'PATCH',
    url: `/api/user/george.python@email.com`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    body: {
      crew: 'Moon',
      role: '',
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

  const updatedUser = result.Items![0]
  t.equal(updatedUser.crew.S, 'Moon')
  t.equal(updatedUser.role.S, '')
})
