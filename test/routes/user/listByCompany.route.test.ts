import { afterEach, beforeEach, test } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'

let app: FastifyInstance

const email = 'user@without.profile'

beforeEach(async () => {
  app = createApp({
    logger: false,
  })
  await app.ready()
})

afterEach(async () => {
  await app.close()
})

test('list by company', async (t) => {
  const company = 'it'
  const token = app.createTestJwt({
    email: email,
    name: 'User Without Profile',
    picture: 'https://test.com/user.without.profile.jpg',
    company: company,
  })

  const response = await app.inject({
    method: 'GET',
    url: '/api/user/list',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)
  response.json().forEach((user: object) => {
    t.hasProp(user, 'id')
    t.hasProp(user, 'name')
    t.hasProp(user, 'email')
    t.hasProp(user, 'crew')
  })

})

test('list by company without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/user/list',
  })

  t.equal(response.statusCode, 401)
})
