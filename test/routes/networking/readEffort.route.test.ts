import {afterEach, beforeEach, test} from 'tap'
import createApp from '@src/app'
import {FastifyInstance} from 'fastify'

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
        url: '/api/networking/effort',
    })

    t.equal(response.statusCode, 401)
})

test('read company networking effort of it', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/networking/effort',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 200)

    const expected = "[{\"company\":\"us\",\"effort\":[{\"skill\":\"PHP\",\"period\":[{\"month\":\"01_23\",\"people\":1,\"averageConfirmed\":50,\"averageTentative\":10,\"averageTotal\":60},{\"month\":\"02_23\",\"people\":1,\"averageConfirmed\":25,\"averageTentative\":75,\"averageTotal\":100}]},{\"skill\":\"Python\",\"period\":[{\"month\":\"01_23\",\"people\":1,\"averageConfirmed\":50,\"averageTentative\":10,\"averageTotal\":60},{\"month\":\"02_23\",\"people\":1,\"averageConfirmed\":25,\"averageTentative\":75,\"averageTotal\":100}]},{\"skill\":\"C# - Backend\",\"period\":[{\"month\":\"01_23\",\"people\":1,\"averageConfirmed\":80,\"averageTentative\":0,\"averageTotal\":80},{\"month\":\"02_23\",\"people\":1,\"averageConfirmed\":50,\"averageTentative\":0,\"averageTotal\":50}]}]},{\"company\":\"it\",\"effort\":[{\"skill\":\"PHP\",\"period\":[{\"month\":\"01_23\",\"people\":2,\"averageConfirmed\":65,\"averageTentative\":0,\"averageTotal\":65},{\"month\":\"02_23\",\"people\":2,\"averageConfirmed\":50,\"averageTentative\":15,\"averageTotal\":65}]},{\"skill\":\"Java/Kotlin\",\"period\":[{\"month\":\"01_23\",\"people\":1,\"averageConfirmed\":50,\"averageTentative\":0,\"averageTotal\":50},{\"month\":\"02_23\",\"people\":1,\"averageConfirmed\":50,\"averageTentative\":30,\"averageTotal\":80}]},{\"skill\":\"Python\",\"period\":[{\"month\":\"01_23\",\"people\":1,\"averageConfirmed\":80,\"averageTentative\":0,\"averageTotal\":80},{\"month\":\"02_23\",\"people\":1,\"averageConfirmed\":50,\"averageTentative\":0,\"averageTotal\":50}]}]}]"
    t.same(response.payload, expected)
})

test('read company networking effort of other', async (t) => {
    const company = 'test company'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/networking/effort',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 200)
    t.same(response.payload, "[]")
})