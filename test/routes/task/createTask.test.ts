import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { TaskListType } from '@src/core/Task/model/task.model'

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

test('create new task - new insert', async (t) => {
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
      customer: 'Test customer',
      company: 'es',
      project: 'Test project',
      task: 'Test task'
    }
  })
  t.equal(response.statusCode, 200)

   response = await app.inject({
    method: 'GET',
    url: '/api/task/task/?company=es&customer=Test customer&project=Test project',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
  t.equal(response.statusCode, 200)
  const tasks = response.json<TaskListType>()
  t.equal(tasks.length, 1)
  const expectedResult = ['Test task']
  t.same(tasks, expectedResult)
})

test('create task with existing customer and new project - new insert', async (t) => {
  const token = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
  })

  //FIRST INSERT
  let response = await app.inject({
    method: 'POST',
    url: '/api/task/task/',
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload: {
      customer: 'Test existing customer',
      company: 'fr',
      project: 'Test old project',
      task: 'Test task old'
    }
  })
  t.equal(response.statusCode, 200)

  response = await app.inject({
    method: 'GET',
    url: '/api/task/task/?company=fr&customer=Test existing customer&project=Test old project',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
  t.equal(response.statusCode, 200)

  let tasks = response.json<TaskListType>()
  t.equal(tasks.length, 1)
  let expectedResult = ['Test task old']
  t.same(tasks, expectedResult)

  //SECOND INSERT
  response = await app.inject({
    method: 'POST',
    url: '/api/task/task/',
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload: {
      customer: 'Test existing customer',
      company: 'fr',
      project: 'Test new project',
      task: 'Test task new'
    }
  })
  t.equal(response.statusCode, 200)

  // CHECK NEW
  response = await app.inject({
    method: 'GET',
    url: '/api/task/task/?company=fr&customer=Test existing customer&project=Test new project',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
  t.equal(response.statusCode, 200)
  tasks = response.json<TaskListType>()
  t.equal(tasks.length, 1)
  expectedResult = ['Test task new']
  t.same(tasks, expectedResult)

  // CHECK OLD STILL EXISTS
  response = await app.inject({
    method: 'GET',
    url: '/api/task/task/?company=fr&customer=Test existing customer&project=Test old project',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
  t.equal(response.statusCode, 200)
  tasks = response.json<TaskListType>()
  t.equal(tasks.length, 1)
  expectedResult = ['Test task old']
  t.same(tasks, expectedResult)
})

test('create task with existing project and new customer - new insert', async (t) => {
  const token = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
  })

  //FIRST INSERT
  let response = await app.inject({
    method: 'POST',
    url: '/api/task/task/',
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload: {
      customer: 'Test old customer',
      company: 'cr',
      project: 'Test existing project',
      task: 'Test task old'
    }
  })
  t.equal(response.statusCode, 200)

  response = await app.inject({
    method: 'GET',
    url: '/api/task/task/?company=cr&customer=Test old customer&project=Test existing project',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
  t.equal(response.statusCode, 200)
  let tasks = response.json<TaskListType>()
  t.equal(tasks.length, 1)
  let expectedResult = ['Test task old']
  t.same(tasks, expectedResult)

  //SECOND INSERT
  response = await app.inject({
    method: 'POST',
    url: '/api/task/task/',
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload: {
      customer: 'Test new customer',
      company: 'cr',
      project: 'Test existing project',
      task: 'Test task new'
    }
  })
  t.equal(response.statusCode, 200)

  // CHECK NEW
  response = await app.inject({
    method: 'GET',
    url: '/api/task/task/?company=cr&customer=Test new customer&project=Test existing project',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
  t.equal(response.statusCode, 200)
  tasks = response.json<TaskListType>()
  t.equal(tasks.length, 1)
  expectedResult = ['Test task new']
  t.same(tasks, expectedResult)

  // CHECK OLD STILL EXISTS
  response = await app.inject({
    method: 'GET',
    url: '/api/task/task/?company=cr&customer=Test old customer&project=Test existing project',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
  t.equal(response.statusCode, 200)
  tasks = response.json<TaskListType>()
  t.equal(tasks.length, 1)
  expectedResult = ['Test task old']
  t.same(tasks, expectedResult)
})

test('create task with same customer and project - update', async (t) => {
  const token = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
  })

  // FIRST INSERT
  let response = await app.inject({
    method: 'POST',
    url: '/api/task/task/',
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload: {
      customer: 'Test customer2',
      company: 'de',
      project: 'Test project2',
      task: 'Test task2'
    }
  })

  t.equal(response.statusCode, 200)

  response = await app.inject({
    method: 'GET',
    url: '/api/task/task/?company=de&customer=Test customer2&project=Test project2',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
    console.log(response.body);
  t.equal(response.statusCode, 200)

  let tasks = response.json<TaskListType>()
  t.equal(tasks.length, 1)

  let expectedResult = ['Test task2']

  t.same(tasks, expectedResult)

  // SECOND INSERT
   response = await app.inject({
    method: 'POST',
    url: '/api/task/task/',
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload: {
      customer: 'Test customer2',
      company: 'de',
      project: 'Test project2',
      task: 'Test task3'
    }
  })

  t.equal(response.statusCode, 200)

  response = await app.inject({
    method: 'GET',
    url: '/api/task/task/?company=de&customer=Test customer2&project=Test project2',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)

  tasks = response.json<TaskListType>()
  t.equal(tasks.length, 2)

  expectedResult = ['Test task2', 'Test task3']

  t.same(tasks, expectedResult)
})

test('create task with existing customer and project but different company - new insert', async (t) => {
  const token = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
  })

  // IT ROW
  let response = await app.inject({
    method: 'POST',
    url: '/api/task/task/',
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload: {
      customer: 'Test company',
      company: 'it',
      project: 'company',
      task: 'Test'
    }
  })
  t.equal(response.statusCode, 200)

  // US ROW
  response = await app.inject({
    method: 'POST',
    url: '/api/task/task/',
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload: {
      customer: 'Test company',
      company: 'us',
      project: 'company',
      task: 'Test2'
    }
  })
  t.equal(response.statusCode, 200)

  //CHECK US TASKS
  response = await app.inject({
    method: 'GET',
    url: '/api/task/task/?company=us&customer=Test company&project=company',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
  t.equal(response.statusCode, 200)

  let tasks = response.json<TaskListType>()
  t.equal(tasks.length, 1)
  t.same(tasks, ['Test2'])

  //CHECK IT TASKS
  response = await app.inject({
    method: 'GET',
    url: '/api/task/task/?company=it&customer=Test company&project=company',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
  t.equal(response.statusCode, 200)
  tasks = response.json<TaskListType>()
  t.equal(tasks.length,1)
  t.same(tasks, [ 'Test' ])
 })