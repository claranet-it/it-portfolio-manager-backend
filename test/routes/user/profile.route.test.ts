import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { DeleteItemCommand } from '@aws-sdk/client-dynamodb'
import { getTableName } from '@src/core/db/TableName'

let app: FastifyInstance

const email = 'user@without.profile'

beforeEach(async () => {
  app = createApp({
    logger: false,
  })
  await app.ready()
})

afterEach(async () => {
  await app.dynamoDBClient.send(
    new DeleteItemCommand({
      TableName: getTableName('UserProfile'),
      Key: { uid: { S: email } },
    }),
  )
  await app.close()
})

test('save user profile', async (t) => {
  const token = app.createTestJwt({
    email: email,
    name: 'User Without Profile',
    picture: 'https://test.com/user.without.profile.jpg',
    company: 'it',
  })

  const response = await app.inject({
    method: 'POST',
    url: '/api/user/profile',
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload: {
      crew: 'moon',
      company: 'us',
      crewLeader: true,
      place: 'Jesi',
      workingExperience: null,
      education: 'University',
      certifications: 'AWS Certified Developer',
    },
  })

  t.equal(response.statusCode, 201)
})

test('save user profile with only crew', async (t) => {
  const token = app.createTestJwt({
    email: email,
    name: 'User Without Profile',
    picture: 'https://test.com/user.without.profile.jpg',
    company: 'it',
  })

  const response = await app.inject({
    method: 'POST',
    url: '/api/user/profile',
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload: {
      crew: 'moon',
    },
  })

  t.equal(response.statusCode, 400)
})

test('save user profile with only company', async (t) => {
  const token = app.createTestJwt({
    email: email,
    name: 'User Without Profile',
    picture: 'https://test.com/user.without.profile.jpg',
    company: 'it',
  })

  const response = await app.inject({
    method: 'POST',
    url: '/api/user/profile',
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload: {
      company: 'us',
    },
  })

  t.equal(response.statusCode, 400)
})

test('save user profile without authentication', async (t) => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/user/profile',
    payload: {
      crew: 'moon',
    },
  })

  t.equal(response.statusCode, 401)
})
