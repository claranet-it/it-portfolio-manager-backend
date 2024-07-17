import {test, beforeEach, afterEach} from 'tap'
import createApp from '@src/app'
import {FastifyInstance} from 'fastify'
import {TimeEntriesForCnaListType} from "@src/core/TimeEntry/model/timeEntry.model";

let app: FastifyInstance

beforeEach(async () => {
    app = createApp({logger: false})
    await app.ready()
})

afterEach(async () => {
    await app.close()
})

test('Read time entry without api key', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/time-entry/time-off-for-cna?user=micol.ts@email.com&month=01&year=2024',
  })
  t.equal(response.statusCode, 401)
})

test('Read time entry with invalid api key', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/time-entry/time-off-for-cna?user=micol.ts@email.com&month=01&year=2024',
        headers: {
            'X-Api-Key': `1243`,
        },
    })
    t.equal(response.statusCode, 401)
})

test('Return time entries for cna', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/time-entry/time-off-for-cna?user=micol.ts@email.com&month=01&year=2024',
        headers: {
            'X-Api-Key': `1234`,
        },
    })
    t.equal(response.statusCode, 200)
    const result = response.json<TimeEntriesForCnaListType>()
    t.equal(result.length, 2)

    const expected = [
        {
            "description":"FESTIVITA",
            "user":{
                "email":"micol.ts@email.com",
                "name":"Micol Panetta"
            },
            "userId":"micol.ts@email.com",
            "billable":false,
            "task":{
                "name":"FESTIVITA"
            },
            "project":{
                "name":"Assenze",
                "billable":false,
                "clientName":"Assenze"
            },
            "timeInterval":{
                "start":"2024-01-01",
                "end":"",
                "duration":"1"
            }
        },
        {
            "description":"MALATTIA (INVIARE CERTIFICATO MEDICO)",
            "user":{
                "email":"micol.ts@email.com",
                "name":"Micol Panetta"
            },
            "userId":"micol.ts@email.com",
            "billable":false,
            "task":{
                "name":"MALATTIA (INVIARE CERTIFICATO MEDICO)"
            },
            "project":{
                "name":"Assenze",
                "billable":false,
                "clientName":"Assenze"
            },
            "timeInterval":{
                "start":"2024-01-01",
                "end":"",
                "duration":"1"
            }
        }
    ]
   t.same(result, expected)
})
