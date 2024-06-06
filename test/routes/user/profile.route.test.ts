import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { DeleteItemCommand } from '@aws-sdk/client-dynamodb'
import { getTableName } from '@src/core/db/TableName'
import { UserWithProfileType } from '@src/core/User/model/user.model'

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
  const company = 'it'
  const token = app.createTestJwt({
    email: email,
    name: 'User Without Profile',
    picture: 'https://test.com/user.without.profile.jpg',
    company: company,
  })

  const response = await app.inject({
    method: 'POST',
    url: '/api/user/profile',
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload: {
      crew: 'moon',
      crewLeader: true,
      place: 'Jesi',
      workingExperience: null,
      education: 'University',
      certifications: 'AWS Certified Developer',
    },
  })

  t.equal(response.statusCode, 201)

  const getUserResponse = await app.inject({
    method: 'GET',
    url: 'api/user/me',
    headers: {authorization: `Bearer ${token}`}
  })
  const result = getUserResponse.json<UserWithProfileType>()
  t.same(result, {
    email: email,
    name: 'User Without Profile',
    picture: 'https://test.com/user.without.profile.jpg',
    crew: 'moon',
    company: company,
    crewLeader: true,
    place: 'Jesi',
    workingExperience: '',
    education:  'University',
    certifications: 'AWS Certified Developer',
  })
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
