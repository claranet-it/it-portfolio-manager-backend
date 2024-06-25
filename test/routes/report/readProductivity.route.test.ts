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

test('read productivity report', async (t) => {
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
            user: {
                email: "micol.panetta@it.clara.net",
                name: "Micol Panetta",
                picture: "https://test.com/micol.pic.jpg"
            },
            workedHours: 40,
            totalTracked: {
                billableProductivity: 60,
                nonBillableProductivity: 10,
                slackTime: 20,
                absence: 10,
            },
            totalProductivity: 70,
        },
        {
            user: {
                email: "mauro.monteneri@it.clara.net",
                name: "Mauro Monteneri",
                picture: "https://test.com/mauro.pic.jpg"
            },
            workedHours: 40,
            totalTracked: {
                billableProductivity: 70,
                nonBillableProductivity: 0,
                slackTime: 10,
                absence: 20,
            },
            totalProductivity: 70,
        }
    ]
    t.same(result, expected)
})