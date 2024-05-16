import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import {
  ProjectListType,
} from '@src/core/Task/model/task.model'

let app: FastifyInstance

beforeEach(async () => {
  app = createApp({ logger: false })
  await app.ready()
})

afterEach(async () => {
  await app.close()
})

test('read projects without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/task/project',
  })

  t.equal(response.statusCode, 401)
})

test('read projects with company and customer param', async (t) => {
  const token = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
  })

  const response = await app.inject({
    method: 'GET',
    url: '/api/task/project/?company=it&customer=Claranet',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)

  const projects = response.json<ProjectListType>()
  t.equal(projects.length, 2)

  const expectedResult = ['Funzionale', 'Slack time']

  t.same(projects, expectedResult)
})
