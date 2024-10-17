import { afterEach, beforeEach, test } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { ProductivityReportResponseType } from '@src/core/Report/model/productivity.model'

let app: FastifyInstance

beforeEach(async () => {
    app = createApp({logger: false})
    await app.ready()
})

afterEach(async () => {
    await app.close()
})

test('read service line productivity report without api-key', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity-service-line?from=2024-01-01&to=2024-01-01',
    })

    t.equal(response.statusCode, 401)
})

test('read service line productivity report with the wrong api-key', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity-service-line?from=2024-01-01&to=2024-01-01',
        headers: {
            'x-api-key': `1243`,
        },
    })

    t.equal(response.statusCode, 401)
})

test('read service line productivity report with api-key', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity-service-line?from=2024-01-01&to=2024-01-01',
        headers: {
            'x-api-key': `1234`,
        },
    })

    t.equal(response.statusCode, 200)
    const result = response.json<ProductivityReportResponseType>();
    const expected = [
        {
            "serviceLine": "Developer",
            "workedHours": 16,
            "totalTracked": {
                "billable": 13,
                "non-billable": 25,
                "slack-time": 37,
                "absence": 25
            },
            "totalProductivity": 38,
        },
        {
            "serviceLine": "Cloud",
            "workedHours": 0,
            "totalTracked": {
                "billable": 0,
                "non-billable": 0,
                "slack-time": 0,
                "absence": 0
            },
            "totalProductivity": 0
        }
    ]

    t.same(result, expected)
})