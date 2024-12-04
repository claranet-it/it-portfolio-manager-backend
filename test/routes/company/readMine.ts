import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { CompanyType } from '@src/core/Company/repository/model/Company'

let app: FastifyInstance

function getToken(): string {
  return app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it',
  })
}

beforeEach(async () => {
  app = createApp({ logger: false })
  await app.ready()
})

afterEach(async () => {
  await app.close()
})

test('Read mine company without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/company/mine',
  })
  t.equal(response.statusCode, 401)
})

test('Read mine company', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/company/mine',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(response.statusCode, 200)
  const result = response.json<CompanyType>()
  t.equal(result.id, 'claranet italia')
  t.equal(result.name, 'it')
})
