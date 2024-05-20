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
  })
}

beforeEach(async () => {
  app = createApp({ logger: false })
  await app.ready()
})

afterEach(async () => {
  await app.close()
})

test('save time entry without authentication', async (t) => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/time-entry/mine',
  })
  t.equal(response.statusCode, 401)
})

test('insert time entry in new day', async (t) => {
  const date = '2024-01-02'
  const customer = 'test add'
  const project = 'test add'
  const task = 'test add'
  const hours = 2
  const addTimeentryResponse = await addTimeEntry(
    date,
    customer,
    project,
    task,
    hours,
  )
  t.equal(addTimeentryResponse.statusCode, 204)

  const getTimeEntryResponse = await app.inject({
    method: 'GET',
    url: '/api/time-entry/mine?from=2024-01-02&to=2024-01-05',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(getTimeEntryResponse.statusCode, 200)
  const timeEntry = getTimeEntryResponse.json<TimeEntryRowListType>()
  t.equal(timeEntry.length, 1)
  t.same(timeEntry[0], {
    user: 'nicholas.crow@email.com',
    date: date,
    customer: customer,
    task: task,
    project: project,
    hours: hours,
  })
})

test('insert time entry in an existing day', async (t) => {
  const date = '2024-01-03'
  const firstCustomer = 'test add'
  const firstProject = 'test add'
  const firstTask = 'test add'
  const firstHours = 2
  const firstResponse = await addTimeEntry(
    date,
    firstCustomer,
    firstProject,
    firstTask,
    firstHours,
  )
  t.equal(firstResponse.statusCode, 204)

  const secondCustomer = 'test add 2'
  const secondProject = 'test add 2'
  const secondTask = 'test add 2'
  const secondHours = 5

  const secondResponse = await addTimeEntry(
    date,
    secondCustomer,
    secondProject,
    secondTask,
    secondHours,
  )
  t.equal(secondResponse.statusCode, 204)

  const getTimeEntryResponse = await app.inject({
    method: 'GET',
    url: '/api/time-entry/mine?from=2024-01-03&to=2024-01-03',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(getTimeEntryResponse.statusCode, 200)
  const timeEntry = getTimeEntryResponse.json<TimeEntryRowListType>()
  t.equal(timeEntry.length, 2)
  t.same(timeEntry, [
    {
      user: 'nicholas.crow@email.com',
      date: date,
      customer: firstCustomer,
      task: firstTask,
      project: firstProject,
      hours: firstHours,
    },
    {
      user: 'nicholas.crow@email.com',
      date: date,
      customer: secondCustomer,
      task: secondTask,
      project: secondProject,
      hours: secondHours,
    },
  ])
})
async function addTimeEntry(
  date: string,
  customer: string,
  project: string,
  task: string,
  hours: number,
) {
  const response = await app.inject({
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
  return response
}
