import {test, beforeEach, afterEach} from 'tap'
import createApp from '@src/app'
import {FastifyInstance} from 'fastify'
import {TimeEntriesForCnaListType, TimeEntryReportListType} from "@src/core/TimeEntry/model/timeEntry.model";

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
    app = createApp({logger: false})
    await app.ready()
})

afterEach(async () => {
    await app.close()
})

test('Read time entry without authorization', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/time-entry/report?from=2024-01-01&to=2024-01-31',
    })
    t.equal(response.statusCode, 401)
})

test('Generate time entries report', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/time-entry/report?from=2024-01-01&to=2024-01-31',
        headers: {
            authorization: `Bearer ${getToken()}`,
        },
    })
    t.equal(response.statusCode, 200)
    console.log(JSON.stringify(response, null, 2))
    //const result = response.json<TimeEntryReportListType>()
    //t.equal(result.length, 2)


    //t.same(result, '')
})
