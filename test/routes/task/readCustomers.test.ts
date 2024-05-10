import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import {
  CustomerListType,
} from '@src/core/Task/model/task.model'

let app: FastifyInstance

beforeEach(async () => {
  app = createApp({ logger: false })
  await app.ready()
})

afterEach(async () => {
  await app.close()
})

test('read customers without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/task/customer',
  })

  t.equal(response.statusCode, 401)
})

test('read customers with company param', async (t) => {
  const token = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
  })

  const response = await app.inject({
    method: 'GET',
    url: '/api/task/customer?company=it',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)

  const customers = response.json<CustomerListType>()
  t.equal(customers.length, 2)

  const expectedResult = ['Claranet', 'test customer']

  t.same(customers, expectedResult)
})

