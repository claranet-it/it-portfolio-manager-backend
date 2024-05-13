import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import {CustomerListType, ProjectListType, TaskListType} from '@src/core/Task/model/task.model'

let app: FastifyInstance

beforeEach(async () => {
  app = createApp({ logger: false })
  await app.ready()
})

afterEach(async () => {
  await app.close()
})

test('create task without authentication', async (t) => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/task/task',
  })

  t.equal(response.statusCode, 401)
})

test('create task with existing customer and project', async (t) => {
  const token = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
  })

  let response = await app.inject({
    method: 'POST',
    url: '/api/task/task/',
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload: {
      customer: 'Claranet',
      company: 'it',
      project: 'Funzionale',
      task: 'Test'
    }
  })

  t.equal(response.statusCode, 200)

   response = await app.inject({
    method: 'GET',
    url: '/api/task/task/?company=it&customer=Claranet&project=Funzionale',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)

  const tasks = response.json<TaskListType>()
  t.equal(tasks.length, 3)

  const expectedResult = ['Attività di portfolio', 'Management', 'Test']

  t.same(tasks, expectedResult)
})

test('create task with existing customer and project but different company', async (t) => {
  const token = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
  })


  // CREATE US ROW
  let response = await app.inject({
    method: 'POST',
    url: '/api/task/task/',
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload: {
      customer: 'Claranet',
      company: 'us',
      project: 'Funzionale',
      task: 'Test'
    }
  })

  t.equal(response.statusCode, 200)

  //CHECK US TASKS
  response = await app.inject({
    method: 'GET',
    url: '/api/task/task/?company=us&customer=Claranet&project=Funzionale',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)

  let tasks = response.json<TaskListType>()
  t.equal(tasks.length, 1)

  t.same(tasks, ['Test'])

  //CHECK IT TASKS
  response = await app.inject({
    method: 'GET',
    url: '/api/task/task/?company=it&customer=Claranet&project=Funzionale',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)

  tasks = response.json<TaskListType>()
  t.ok(tasks.length >= 2)

  t.has(tasks, [ 'Attività di portfolio', 'Management' ])

  //CHECK IT CUSTOMERS
  response = await app.inject({
    method: 'GET',
    url: '/api/task/customer?company=it',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)

  const customers = response.json<CustomerListType>()
  t.equal(customers.length, 2)

  let expectedResult = ['Claranet', 'test customer']

  t.same(customers, expectedResult)

  response = await app.inject({
    method: 'GET',
    url: '/api/task/project/?company=it&customer=Claranet',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)

  const projects = response.json<ProjectListType>()
  t.ok(projects.length >= 2)

  expectedResult = ['Funzionale', 'Slack time']

  t.has(projects, expectedResult)
 })