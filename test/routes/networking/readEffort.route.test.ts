import {afterEach, beforeEach, test} from 'tap'
import createApp from '@src/app'
import {FastifyInstance} from 'fastify'
import {NetworkingEffortResponseType} from "@src/core/Networking/model/networking.model";

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

test('read networking effort without authentication', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/networking/effort/next',
    })

    t.equal(response.statusCode, 401)
})

test('read company networking effort of it', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/networking/effort/next',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 200)

    const result = response.json<NetworkingEffortResponseType>();

    const expected = [
        {
            "test company" : []
        },
        {
            us: [
                {
                    skill: "PHP",
                    name: "us",
                    effort: [
                        {
                            month_year: "01_23",
                            people: 1,
                            confirmedEffort: 50,
                            tentativeEffort: 10,
                            totalEffort: 60
                        },
                        {
                            month_year: "02_23",
                            people: 1,
                            confirmedEffort: 25,
                            tentativeEffort: 75,
                            totalEffort: 100
                        }

                    ]

                },
                {
                    skill: "Python",
                    name: "us",
                    effort: [
                        {
                            month_year: "01_23",
                            people: 1,
                            confirmedEffort: 50,
                            tentativeEffort: 10,
                            totalEffort: 60
                        },
                        {
                            month_year: "02_23",
                            people: 1,
                            confirmedEffort: 25,
                            tentativeEffort: 75,
                            totalEffort: 100
                        }
                    ]
                }],
        },

        {
            it: [
                {
                    skill: "PHP",
                    name: "it",
                    effort: [
                        {
                            month_year: "01_23",
                            people: 2,
                            confirmedEffort: 65,
                            tentativeEffort: 0,
                            totalEffort: 65
                        },
                        {
                            month_year: "02_23",
                            people: 2,
                            confirmedEffort: 50,
                            tentativeEffort: 15,
                            totalEffort: 65
                        }
                    ]
                },
                {
                    skill: "Java/Kotlin",
                    name: "it",
                    effort: [
                        {
                            month_year: "01_23",
                            people: 1,
                            confirmedEffort: 50,
                            tentativeEffort: 0,
                            totalEffort: 50
                        },
                        {
                            month_year: "02_23",
                            people: 1,
                            confirmedEffort: 50,
                            tentativeEffort: 30,
                            totalEffort: 80
                        }
                    ]
                },
                {
                    skill: "Python",
                    name: "it",
                    effort: [
                        {
                            month_year: "01_23",
                            people: 1,
                            confirmedEffort: 80,
                            tentativeEffort: 0,
                            totalEffort: 80
                        },
                        {
                            month_year: "02_23",
                            people: 1,
                            confirmedEffort: 50,
                            tentativeEffort: 0,
                            totalEffort: 50
                        }
                    ]
                }
            ]
        }
    ]
    t.same(result, expected)
})

test('read company networking effort of other', async (t) => {
    const company = 'test company'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/networking/effort/next',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 200)
    t.same(response.payload, "[]")
})