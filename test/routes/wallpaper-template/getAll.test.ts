import { FastifyInstance } from 'fastify'
import { test, before, after } from 'tap'
import createApp from '@src/app'
import { getToken } from '@test/utils/token'

let app: FastifyInstance
const FAKE_EMAIL = 'TEST@email.com'

before(async () => {
  app = createApp({ logger: false })
  await app.ready()
})

after(async () => {
  await app.close()
})

test('should return 401 without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/background-template',
  })
  t.equal(response.statusCode, 401)
})

test('should return 200', async (t) => {
  const token = getToken(app, FAKE_EMAIL)
  const response = await app.inject({
    method: 'GET',
    url: '/api/background-template',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  t.equal(response.statusCode, 200)
})

