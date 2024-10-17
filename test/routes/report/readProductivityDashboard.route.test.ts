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

test('read productivity report without api-key', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity-dashboard?from=2024-01-01&to=2024-01-01',
    })

    t.equal(response.statusCode, 401)
})

test('read productivity report with the wrong api-key', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity-dashboard?from=2024-01-01&to=2024-01-01',
        headers: {
            'x-api-key': `1243`,
        },
    })

    t.equal(response.statusCode, 401)
})

test('read productivity report with api-key', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity-dashboard?from=2024-01-01&to=2024-01-01',
        headers: {
            'x-api-key': `1234`,
        },
    })

    t.equal(response.statusCode, 200)
    const result = response.json<ProductivityReportResponseType>();
    const expected = [
        {
            "user":{
                "email":"resigned@email.com",
                "name":"resigned",
                "picture":"picture-url",
                "crew": "moon",
                "serviceLine": "Developer",
            },
            "workedHours":0,
            "totalTracked":{
                "billable":0,
                "non-billable":0,
                "slack-time":0,
                "absence":0
            },
            "totalProductivity":0
        },
        {
            "user":{
                "email":"micol.ts@email.com",
                "name":"Micol Panetta",
                "picture":"picture-url",
                "crew": "sun",
                "serviceLine": "Developer",
            },
            "workedHours":8,
            "totalTracked":{
                "billable":25,
                "non-billable":25,
                "slack-time":25,
                "absence":25
            },
            "totalProductivity":50
        },
        {
            "user":{
                "email":"nicholas.crow@email.com",
                "name":"Nicholas Crow",
                "picture":"picture-url",
                "crew": "moon",
                "serviceLine": "Developer",
            },
            "workedHours":8,
            "totalTracked":{
                "billable":0,
                "non-billable":25,
                "slack-time":50,
                "absence":25
            },
            "totalProductivity":25
        },
        {
            "user":{
                "email":"testIt@test.com",
                "name":"test italian",
                "picture":"",
                "crew": "bees",
                "serviceLine": "Developer",
            },
            "workedHours":0,
            "totalTracked":{
                "billable":0,
                "non-billable":0,
                "slack-time":0,
                "absence":0
            },
            "totalProductivity":0
        }
    ]

    t.same(result, expected)
})