import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { TimeEntryRowListType } from '@src/core/TimeEntry/model/timeEntry.model'

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

test('delete time entry without authentication', async (t) => {
  const response = await app.inject({
    method: 'DELETE',
    url: '/api/time-entry/mine',
  })
  t.equal(response.statusCode, 401)
})

test('delete time entry', async (t) => {
  const date = '2024-01-10'
  const customer = 'Claranet'
  const project = 'Slack time'
  const task = 'formazione'
  const hours = 2
  const addResponse = await app.inject({
    method: 'POST',
    url: '/api/time-entry/mine',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    payload: {
      date: date,
      customer: customer,
      project: project,
      task: task,
      hours: hours,
    },
  })
  t.equal(addResponse.statusCode, 204)
  const deleteRespose = await app.inject({
    method: 'DELETE',
    url: '/api/time-entry/mine',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    payload: {
        date: date,
        customer: customer,
        project: project,
        task: task,
      },
  })
  t.equal(deleteRespose.statusCode, 200)

  const getResponse = await app.inject({
    method: 'GET',
    url: `/api/time-entry/mine?from=${date}&to=${date}`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  const result = getResponse.json<TimeEntryRowListType>()
  t.same(result, [])
})

test('delete the right time entry if there are more than one', async (t) => {
  const date = '2024-01-10'
  const customer = 'Claranet'
  const project = 'Slack time'
  const task = 'formazione'
  const addResponse1 = await createTimeEntry(date, customer, project, task, 1, 0)
  t.equal(addResponse1.statusCode, 204)
  const addResponse2 = await createTimeEntry(date, customer, project, task, 2, 1)
  t.equal(addResponse2.statusCode, 204)
  const deleteRespose = await app.inject({
    method: 'DELETE',
    url: '/api/time-entry/mine',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    payload: {
        date: date,
        customer: customer,
        project: project,
        task: task,
        index: 1,
      },
  })
  t.equal(deleteRespose.statusCode, 200)

  const getResponse = await app.inject({
    method: 'GET',
    url: `/api/time-entry/mine?from=${date}&to=${date}`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  const result = getResponse.json<TimeEntryRowListType>()
  t.same(result, [{
    user: "nicholas.crow@email.com",
    company: "it",
    date: date,
    customer: customer,
    project: project,
    task: task,
    hours: 1,
    description: "",
    startHour: "",
    endHour: "",
    index: 0,
  }])

  const cleanupResponse = await cleanup(date, customer, project, task)
  t.equal(cleanupResponse.statusCode, 200)

  const cleanupCheckResponse = await app.inject({
    method: 'GET',
    url: `/api/time-entry/mine?from=${date}&to=${date}`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  const cleanupCheckResult = cleanupCheckResponse.json<TimeEntryRowListType>()
  t.same(cleanupCheckResult, [])
})

test('delete the right time entry if there are more than one by setting hours to 0', async (t) => {
  const date = '2024-01-10'
  const customer = 'Claranet'
  const project = 'Slack time'
  const task = 'formazione'
  const addResponse1 = await createTimeEntry(date, customer, project, task, 1, 0)
  t.equal(addResponse1.statusCode, 204)
  const addResponse2 = await createTimeEntry(date, customer, project, task, 2, 1)
  t.equal(addResponse2.statusCode, 204)
  const deleteRespose = await app.inject({
    method: 'POST',
    url: '/api/time-entry/mine',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    payload: {
        date: date,
        customer: customer,
        project: project,
        task: task,
        hours: 0,
        index: 1,
      },
  })
  t.equal(deleteRespose.statusCode, 204)

  const getResponse = await app.inject({
    method: 'GET',
    url: `/api/time-entry/mine?from=${date}&to=${date}`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  const result = getResponse.json<TimeEntryRowListType>()
  t.same(result, [{
    user: "nicholas.crow@email.com",
    company: "it",
    date: date,
    customer: customer,
    project: project,
    task: task,
    hours: 1,
    description: "",
    startHour: "",
    endHour: "",
    index: 0,
  }])

  const cleanupResponse = await cleanup(date, customer, project, task)
  t.equal(cleanupResponse.statusCode, 200)

  const cleanupCheckResponse = await app.inject({
    method: 'GET',
    url: `/api/time-entry/mine?from=${date}&to=${date}`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  const cleanupCheckResult = cleanupCheckResponse.json<TimeEntryRowListType>()
  t.same(cleanupCheckResult, [])
})

async function createTimeEntry(date: string, customer: string, project: string, task: string, hours: number, index?: number) {
  return app.inject({
    method: 'POST',
    url: '/api/time-entry/mine',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    payload: {
      date: date,
      customer: customer,
      project: project,
      task: task,
      hours: hours,
      index: index,
    },
  })
}
async function cleanup(date: string, customer: string, project: string, task: string) {
  return app.inject({
    method: 'DELETE',
    url: '/api/time-entry/mine',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    payload: {
        date: date,
        customer: customer,
        project: project,
        task: task,
        index: 0,
      },
  })
}