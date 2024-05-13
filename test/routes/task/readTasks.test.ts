import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { TaskListType} from '@src/core/Task/model/task.model'

let app: FastifyInstance

beforeEach(async () => {
  app = createApp({ logger: false })
  await app.ready()
})

afterEach(async () => {
  await app.close()
})

test('read tasks without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/task/task',
  })

  t.equal(response.statusCode, 401)
})

test('read task with company, customer and project param', async (t) => {
  const token = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
  })

  const response = await app.inject({
    method: 'GET',
    url: '/api/task/task/?company=it&customer=Claranet&project=Funzionale',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)

  const tasks = response.json<TaskListType>()
  t.ok(tasks.length >= 2)

  const expectedResult = ['Attività di portfolio', 'Management']

  t.has(tasks, expectedResult)
})
