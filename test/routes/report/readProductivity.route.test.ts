import {afterEach, beforeEach, test} from 'tap'
import createApp from '@src/app'
import {FastifyInstance} from 'fastify'
import {ProductivityReportResponseType} from "@src/core/Report/model/productivity.model";

let app: FastifyInstance

function getToken(company: string): string {
    return app.createTestJwt({
        email: 'nicholas.crow@email.com',
        name: 'Nicholas Crow',
        picture: 'https://test.com/nicholas.crow.jpg',
        company: company,
    })
}

beforeEach(async () => {
    app = createApp({logger: false})
    await app.ready()
})

afterEach(async () => {
    await app.close()
})

test('read productivity report without authentication', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity',
    })

    t.equal(response.statusCode, 401)
})

test('read productivity report fail: startDate > endDate', async (t) => {
    const company = 'it'
    const token = getToken(company)

    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-02-01&to=2024-01-01',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 400)
    t.equal(response.body, JSON.stringify({
        message: 'End date 2024-02-01 must be greater than Start date 2024-01-01',
    }));
})

test('read productivity report: no working day', async (t) => {
    const company = 'it'
    const token = getToken(company)

    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-06&to=2024-01-06',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 200)
    const result = response.json<ProductivityReportResponseType>();
    const expected = [
        {
            "user":{
                "email":"micol.ts@email.com",
                "name":"Micol Panetta",
                "picture":"picture-url"
            },
            "workedHours":0,
            "totalTracked":{
                "billableProductivity":0,
                "nonBillableProductivity":0,
                "slackTime":0,
                "absence":0
            },
            "totalProductivity":0
        },
        {
            "user":{
                "email":"george.python@email.com",
                "name":"George Python",
                "picture":""
            },
            "workedHours":0,
            "totalTracked":{
                "billableProductivity":0,
                "nonBillableProductivity":0,
                "slackTime":0,
                "absence":0
            },
            "totalProductivity":0
        },
        {
            "user":{
                "email":"nicholas.crow@email.com",
                "name":"Nicholas Crow",
                "picture":"picture-url"
            },
            "workedHours":0,
            "totalTracked":{
                "billableProductivity":0,
                "nonBillableProductivity":0,
                "slackTime":0,
                "absence":0
            },
            "totalProductivity":0
        },
        {
            "user":{
                "email":"testIt@test.com",
                "name":"test italian",
                "picture":""
            },
            "workedHours":0,
            "totalTracked":{
                "billableProductivity":0,
                "nonBillableProductivity":0,
                "slackTime":0,
                "absence":0
            },
            "totalProductivity":0
        }
    ]

    t.same(result, expected)
})

test('read productivity report 1 month', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-02-01',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 200)
    const result = response.json<ProductivityReportResponseType>();
    const expected = [
        {
            "user":{
                "email":"micol.ts@email.com",
                "name":"Micol Panetta",
                "picture":"picture-url"
            },
            "workedHours":12,
            "totalTracked":{
                "billableProductivity":3,
                "nonBillableProductivity":0,
                "slackTime":2,
                "absence":1
            },
            "totalProductivity":3
        },
        {
            "user":{
                "email":"george.python@email.com",
                "name":"George Python",
                "picture":""
            },
            "workedHours":0,
            "totalTracked":{
                "billableProductivity":0,
                "nonBillableProductivity":0,
                "slackTime":0,
                "absence":0
            },
            "totalProductivity":0
        },
        {
            "user":{
                "email":"nicholas.crow@email.com",
                "name":"Nicholas Crow",
                "picture":"picture-url"
            },
            "workedHours":8,
            "totalTracked":{
                "billableProductivity":2,
                "nonBillableProductivity":0,
                "slackTime":2,
                "absence":0
            },
            "totalProductivity":2
        },
        {
            "user":{
                "email":"testIt@test.com",
                "name":"test italian",
                "picture":""
            },
            "workedHours":0,
            "totalTracked":{
                "billableProductivity":0,
                "nonBillableProductivity":0,
                "slackTime":0,
                "absence":0
            },
            "totalProductivity":0
        }
    ]

    t.same(result, expected)
})

test('read productivity report 1 day', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 200)
    const result = response.json<ProductivityReportResponseType>();
    const expected = [
        {
            "user":{
                "email":"micol.ts@email.com",
                "name":"Micol Panetta",
                "picture":"picture-url"
            },
            "workedHours":8,
            "totalTracked":{
                "billableProductivity":50,
                "nonBillableProductivity":0,
                "slackTime":25,
                "absence":25
            },
            "totalProductivity":50
        },
        {
            "user":{
                "email":"george.python@email.com",
                "name":"George Python",
                "picture":""
            },
            "workedHours":0,
            "totalTracked":{
                "billableProductivity":0,
                "nonBillableProductivity":0,
                "slackTime":0,
                "absence":0
            },
            "totalProductivity":0
        },
        {
            "user":{
                "email":"nicholas.crow@email.com",
                "name":"Nicholas Crow",
                "picture":"picture-url"
            },
            "workedHours":8,
            "totalTracked":{
                "billableProductivity":50,
                "nonBillableProductivity":0,
                "slackTime":50,
                "absence":0
            },
            "totalProductivity":50
        },
        {
            "user":{
                "email":"testIt@test.com",
                "name":"test italian",
                "picture":""
            },
            "workedHours":0,
            "totalTracked":{
                "billableProductivity":0,
                "nonBillableProductivity":0,
                "slackTime":0,
                "absence":0
            },
            "totalProductivity":0
        }
    ]

    t.same(result, expected)
})