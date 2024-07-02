import {test, beforeEach, afterEach} from 'tap'
import createApp from '@src/app'
import {FastifyInstance} from 'fastify'
import {TimeEntriesForCnaListType} from "@src/core/TimeEntry/model/timeEntry.model";
//import { TimeEntriesForCnaType } from '@src/core/TimeEntry/model/timeEntry.model'

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
    app = createApp({logger: false})
    await app.ready()
})

afterEach(async () => {
    await app.close()
})

// test('Read time entry without authentication', async (t) => {
//   const response = await app.inject({
//     method: 'GET',
//     url: '/api/time-entry/time-off-for-cna?company=it&month=01&year=2024',
//   })
//   t.equal(response.statusCode, 401)
// })

test('Return time entries for cna', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/time-entry/time-off-for-cna?company=test&month=01&year=2024',
        headers: {
            //authorization: `Bearer ${getToken()}`,
        },
    })
    t.equal(response.statusCode, 200)
    const result = response.json<TimeEntriesForCnaListType>()
    t.equal(result.length, 2)

    const expected = [
        {
            "description":"",
            "user":{
                "email":"micol.ts@email.com",
                "name":"Micol Panetta"
            },
            "userId":"micol.ts@email.com",
            "billable":false,
            "task":{
                "name":"Malattia"
            },
            "project":{
                "name":"Assenze",
                "billable":false,
                "clientName":"Assenze"
            },
            "timeInterval":{
                "start":"2024-01-01",
                "end":"",
                "duration":"2"
            }
        },
        {
            "description":"",
            "user":{
                "email":"nicholas.crow@email.com",
                "name":"Nicholas Crow"
            },
            "userId":"nicholas.crow@email.com",
            "billable":false,
            "task":{
                "name":"Donazione sangue"
            },
            "project":{
                "name":"Assenze",
                "billable":false,
                "clientName":"Assenze"
            },
            "timeInterval":{
                "start":"2024-01-01",
                "end":"",
                "duration":"2"
            }
        }
    ]
    t.same(result, expected)
})
