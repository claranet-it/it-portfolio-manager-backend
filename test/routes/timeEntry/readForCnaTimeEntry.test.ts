import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { TimeEntryRowListWithProjectType} from '@src/core/TimeEntry/model/timeEntry.model'

let app: FastifyInstance

// function getToken(): string {
//   return app.createTestJwt({
//     email: 'nicholas.crow@email.com',
//     name: 'Nicholas Crow',
//     picture: 'https://test.com/nicholas.crow.jpg',
//     company: 'it',
//   })
// }

beforeEach(async () => {
  app = createApp({ logger: false })
  await app.ready()
})

afterEach(async () => {
  await app.close()
})

// test('Read time entry without authentication', async (t) => {
//   const response = await app.inject({
//     method: 'GET',
//     url: '/api/time-entry/cna?users[]=micol.ts@email.com&users[]=nicholas.crow@email.com&month=01&year=2024&company=it',
//   })
//   t.equal(response.statusCode, 401)
// })

test('Return time entries for cna', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/time-entry/cna?users=micol.ts@email.com&users=nicholas.crow@email.com&month=01&year=2024&company=it',
    headers: {
      //authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(response.statusCode, 200)
  const result = response.json<TimeEntryRowListWithProjectType>()
  t.equal(result.length, 2)
  t.same(result, [
    {
      user: 'nicholas.crow@email.com',
      date: '2024-01-01',
      company: 'it',
      customer: 'Claranet',
      project: 'Funzionale',
      projectType: 'billable',
      task: 'Attività di portfolio',
      hours: 2,
    },
    {
      user: 'nicholas.crow@email.com',
      date: '2024-01-01',
      company: 'it',
      customer: 'Claranet',
      project: 'Slack time',
      projectType: 'billable',
      task: 'formazione',
      hours: 2,
    },
  ])
})
