import { afterEach, beforeEach, test } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { TaskStructureListType } from '@src/core/Task/model/task.model'

let app: FastifyInstance

beforeEach(async () => {
  app = createApp({ logger: false })
  await app.ready()
})

afterEach(async () => {
  await app.close()
})

test('list tasks without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/task/task-list',
  })

  t.equal(response.statusCode, 401)
})

test('list tasks', async (t) => {
  const input = {
    company: 'it',
    customer: 'Claranet',
    project: 'Slack time',
  }

  const token = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: input.company
  })

  const response = await app.inject({
    method: 'GET',
    url: `/api/task/task-list`,
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)

  const tasks = response.json<TaskStructureListType>()
  tasks.forEach((task) => {
    t.same(Object.keys(task), ['customer', 'project', 'task'])
  })
})