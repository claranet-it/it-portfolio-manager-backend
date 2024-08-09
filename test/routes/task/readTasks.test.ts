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

const inputs = [
  {
    company: 'it',
    customer: 'Claranet',
    project: 'Funzionale',
    expectedTasks: [{name: 'Attività di portfolio', completed: false, plannedHours: 0}, {name: "Management", completed: false, plannedHours: 0},],
  },
  {
    company: 'it',
    customer: 'Claranet',
    project: 'Slack time',
    expectedTasks: [{name: 'formazione', completed: false, plannedHours: 0}],
  },
  {
    company: 'it',
    customer: 'test customer',
    project: 'SOR Sviluppo',
    expectedTasks: [{name: 'Iterazione 1', completed: false, plannedHours: 0}, {name: 'Iterazione 2', completed: false, plannedHours: 0}],
  }
]

inputs.forEach((input) => {
  test('read task with company, customer and project param', async (t) => {
    const token = app.createTestJwt({
      email: 'nicholas.crow@email.com',
      name: 'Nicholas Crow',
      picture: 'https://test.com/nicholas.crow.jpg',
      company: input.company
    })

    const response = await app.inject({
      method: 'GET',
      url: `/api/task/task?customer=${input.customer}&project=${input.project}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    t.equal(response.statusCode, 200)

    const tasks = response.json<TaskListType>()
    t.equal(tasks.length, input.expectedTasks.length)
    t.same(tasks, input.expectedTasks)
  })
})

test('read task with additional properties', async (t) => {
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
    url: `/api/task/task?customer=${input.customer}&project=${input.project}`,
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)

  const tasks = response.json<TaskListType>()
  t.equal(tasks.length, 1)
  t.same(tasks, [{
    name: 'formazione',
    completed: false,
    plannedHours: 0,
  }])
})