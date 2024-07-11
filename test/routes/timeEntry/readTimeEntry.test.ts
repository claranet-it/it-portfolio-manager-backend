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

test('Read time entry without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/time-entry/mine?from=2024-01-01&to2024-01-10',
  })
  t.equal(response.statusCode, 401)
})

test('Return empty array on no entries in date range', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/time-entry/mine?from=2025-01-01&to=2025-01-10',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(response.statusCode, 200)
  const result = response.json<TimeEntryRowListType>()
  t.same(result, [])
})

test('Return time entries', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/time-entry/mine?from=2024-01-01&to=2024-01-01',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(response.statusCode, 200)
  const result = response.json<TimeEntryRowListType>()
  t.equal(result.length, 3)
  t.same(result, [
    {
      user: 'nicholas.crow@email.com',
      date: '2024-01-01',
      company: 'it',
      customer: 'Claranet',
      project: 'Assenze',
      task: 'DONAZIONE SANGUE',
      hours: 2,
    },
    {
      user: 'nicholas.crow@email.com',
      date: '2024-01-01',
      company: 'it',
      customer: 'Claranet',
      project: 'Funzionale',
      task: 'Attività di portfolio',
      hours: 2,
    },
    {
      user: 'nicholas.crow@email.com',
      date: '2024-01-01',
      company: 'it',
      customer: 'Claranet',
      project: 'Slack time',
      task: 'formazione',
      hours: 4,
    },
  ])
})
