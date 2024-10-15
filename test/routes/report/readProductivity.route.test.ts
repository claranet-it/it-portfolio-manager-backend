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
                "picture":"picture-url",
                "crew": "sun",
                "serviceLine": "",
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
                "email":"nicholas.crow@email.com",
                "name":"Nicholas Crow",
                "picture":"picture-url",
                "crew": "moon",
                "serviceLine": "",
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
                "email":"testIt@test.com",
                "name":"test italian",
                "picture":"",
                "crew": "bees",
                "serviceLine": "",
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

test('read productivity report: no working day with name filter', async (t) => {
    const company = 'it'
    const token = getToken(company)

    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-06&to=2024-01-06&name=Micol',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 200)
    const result = response.json<ProductivityReportResponseType>();

    t.same(result, [])
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
                "picture":"picture-url",
                "crew": "sun",
                "serviceLine": "",
            },
            "workedHours":12,
            "totalTracked":{
                "billable":1,
                "non-billable":3,
                "slack-time":2,
                "absence":0
            },
            "totalProductivity":4
        },
        {
            "user":{
                "email":"nicholas.crow@email.com",
                "name":"Nicholas Crow",
                "picture":"picture-url",
                "crew": "moon",
                "serviceLine": "",
            },
            "workedHours":8,
            "totalTracked":{
                "billable":0,
                "non-billable":1,
                "slack-time":2,
                "absence":1
            },
            "totalProductivity":1
        },
        {
            "user":{
                "email":"testIt@test.com",
                "name":"test italian",
                "picture":"",
                "crew": "bees",
                "serviceLine": "",
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

test('read productivity report 1 week', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-07',
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
                "picture":"picture-url",
                "crew": "sun",
                "serviceLine": "",
            },
            "workedHours":8,
            "totalTracked":{
                "billable":5,
                "non-billable":8,
                "slack-time":5,
                "absence":2
            },
            "totalProductivity":13
        },
        {
            "user":{
                "email":"nicholas.crow@email.com",
                "name":"Nicholas Crow",
                "picture":"picture-url",
                "crew": "moon",
                "serviceLine": "",
            },
            "workedHours":8,
            "totalTracked":{
                "billable":0,
                "non-billable":5,
                "slack-time":10,
                "absence":5
            },
            "totalProductivity":5
        },
        {
            "user":{
                "email":"testIt@test.com",
                "name":"test italian",
                "picture":"",
                "crew": "bees",
                "serviceLine": "",
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
                "picture":"picture-url",
                "crew": "sun",
                "serviceLine": "",
            },
            "workedHours":8,
            "totalTracked":{
                "billable":25,
                "non-billable":38,
                "slack-time":25,
                "absence":12
            },
            "totalProductivity":63
        },
        {
            "user":{
                "email":"nicholas.crow@email.com",
                "name":"Nicholas Crow",
                "picture":"picture-url",
                "crew": "moon",
                "serviceLine": "",
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
                "serviceLine": "",
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

test('read productivity report - only task filter => bad request', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&task=Attività di portfolio',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 400)
    t.equal(response.body, JSON.stringify({
        message: 'You must select a Customer first, then a Project and finally a Task.',
    }));
})

test('read productivity report - only project filter => bad request', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&project=Funzionale',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 400)
    t.equal(response.body, JSON.stringify({
        message: 'You must select a Customer first, then a Project and finally a Task.',
    }));
})

test('read productivity report - project and task filter => bad request', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&project=Funzionale&task=Attività di portfolio',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 400)
    t.equal(response.body, JSON.stringify({
        message: 'You must select a Customer first, then a Project and finally a Task.',
    }));
})

test('read productivity report - project & name filter => bad request', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&project=Funzionale&name=Micol',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 400)
    t.equal(response.body, JSON.stringify({
        message: 'You must select a Customer first, then a Project and finally a Task.',
    }));
})

test('read productivity report - task & name filter => bad request', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&task=Attività di portfolio&name=Micol',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 400)
    t.equal(response.body, JSON.stringify({
        message: 'You must select a Customer first, then a Project and finally a Task.',
    }));
})

test('read productivity report - project & task & name filter => bad request', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&project=Funzionale&task=Attività di portfolio&name=Micol',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 400)
    t.equal(response.body, JSON.stringify({
        message: 'You must select a Customer first, then a Project and finally a Task.',
    }));
})

test('read productivity report - customer filter', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&customer=test customer',
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
                "picture":"picture-url",
                "crew": "sun",
                "serviceLine": "",
            },
            "workedHours":2,
            "totalTracked":{
                "billable":25,
                "non-billable":0,
                "slack-time":0,
                "absence":0
            },
            "totalProductivity":25
        },
    ]

    t.same(result, expected)
})

test('read productivity report - customer & project filter', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&customer=Claranet&project=Assenze',
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
                "picture":"picture-url",
                "crew": "sun",
                "serviceLine": "",
            },
            "workedHours":2,
            "totalTracked":{
                "billable":0,
                "non-billable":13,
                "slack-time":0,
                "absence":12
            },
            "totalProductivity":13
        },
        {
            "user":{
                "email":"nicholas.crow@email.com",
                "name":"Nicholas Crow",
                "picture":"picture-url",
                "crew": "moon",
                "serviceLine": "",
            },
            "workedHours":2,
            "totalTracked":{
                "billable":0,
                "non-billable":0,
                "slack-time":0,
                "absence":25
            },
            "totalProductivity":0
        },
    ]

    t.same(result, expected)
})

test('read productivity report - customer & project & task filter', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&customer=Claranet&project=Funzionale&task=Attività di portfolio',
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
                "picture":"picture-url",
                "crew": "sun",
                "serviceLine": "",
            },
            "workedHours":2,
            "totalTracked":{
                "billable":0,
                "non-billable":25,
                "slack-time":0,
                "absence":0
            },
            "totalProductivity":25
        },
        {
            "user":{
                "email":"nicholas.crow@email.com",
                "name":"Nicholas Crow",
                "picture":"picture-url",
                "crew": "moon",
                "serviceLine": "",
            },
            "workedHours":2,
            "totalTracked":{
                "billable":0,
                "non-billable":25,
                "slack-time":0,
                "absence":0
            },
            "totalProductivity":25
        },
    ]

    t.same(result, expected)
})

test('read productivity report - only name filter', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&name=Micol',
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
                "picture":"picture-url",
                "crew": "sun",
                "serviceLine": "",
            },
            "workedHours":8,
            "totalTracked":{
                "billable":25,
                "non-billable":38,
                "slack-time":25,
                "absence":12
            },
            "totalProductivity":63
        },
    ]

    t.same(result, expected)
})

test('read productivity report - non-existing name filter', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&name=Pippo',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 200)
    const result = response.json<ProductivityReportResponseType>();
    t.same(result, [])
})

test('read productivity report - customer & project & task & name filter', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&customer=Claranet&project=Funzionale&task=Attività di portfolio&name=Micol',
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
                "picture":"picture-url",
                "crew": "sun",
                "serviceLine": "",
            },
            "workedHours":2,
            "totalTracked":{
                "billable":0,
                "non-billable":25,
                "slack-time":0,
                "absence":0
            },
            "totalProductivity":25
        },
     ]

    t.same(result, expected)
})

test('read productivity report - customer & project & name filter', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&customer=Claranet&project=Funzionale&name=Micol',
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
                "picture":"picture-url",
                "crew": "sun",
                "serviceLine": "",
            },
            "workedHours":2,
            "totalTracked":{
                "billable":0,
                "non-billable":25,
                "slack-time":0,
                "absence":0
            },
            "totalProductivity":25
        },
    ]

    t.same(result, expected)
})

test('read productivity report - name & customer filter', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&name=Panetta&customer=test customer',
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
                "picture":"picture-url",
                "crew": "sun",
                "serviceLine": "",
            },
            "workedHours":2,
            "totalTracked":{
                "billable":25,
                "non-billable":0,
                "slack-time":0,
                "absence":0
            },
            "totalProductivity":25
        },
    ]

    t.same(result, expected)
})