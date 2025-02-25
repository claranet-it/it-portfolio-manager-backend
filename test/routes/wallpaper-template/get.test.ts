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
    url: '/api/background-template/fakeKey',
  })
  t.equal(response.statusCode, 401)
})

test('should return 200 with valid key', async (t) => {
  const token = getToken(app, FAKE_EMAIL)
  const getAllResponse = await app.inject({
    method: 'GET',
    url: '/api/background-template',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = getAllResponse.json();
  const keys = Object.keys(data);
  const key = data[keys[0]][0].key

  const getResponse = await app.inject({
    method: 'GET',
    url: `/api/background-template/${encodeURIComponent(key)}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  t.equal(getResponse.statusCode, 200)
})

