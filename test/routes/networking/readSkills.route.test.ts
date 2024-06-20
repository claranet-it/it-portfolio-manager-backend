import {afterEach, beforeEach, test} from 'tap'
import createApp from '@src/app'
import {FastifyInstance} from 'fastify'
import {NetworkingSkillsResponseType} from "@src/core/Networking/model/networking.model";

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

test('read networking skills without authentication', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/networking/skills',
    })

    t.equal(response.statusCode, 401)
})

test("read company networking skills of it", async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/networking/skills',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 200)
    const result = response.json<NetworkingSkillsResponseType>();
    const expected = [{"test company":{"company":"test company","skills":{"C#":{"averageScore":2,"people":1},"Elixir":{"averageScore":0,"people":0},"Frontend (JS/TS)":{"averageScore":0,"people":0},"Java/Kotlin":{"averageScore":0,"people":0},"Multiplatform Mobile (ionic, react-native, flutter)":{"averageScore":0,"people":0},"Native Android":{"averageScore":0,"people":0},"Native iOS":{"averageScore":0,"people":0},"NodeJS (JS/TS)":{"averageScore":0,"people":0},"PHP":{"averageScore":0,"people":0},"Python":{"averageScore":0,"people":0},"Ruby (Rails)":{"averageScore":0,"people":0},"Rust":{"averageScore":0,"people":0},"UI Development (HTML/CSS/SCSS)":{"averageScore":0,"people":0},"AWS Cloudformation":{"averageScore":0,"people":0},"AWS ECS":{"averageScore":0,"people":0},"AWS EKS":{"averageScore":0,"people":0},"AWS cloud governance":{"averageScore":0,"people":0},"AWS core":{"averageScore":0,"people":0},"AWS finance":{"averageScore":0,"people":0},"AWS migration":{"averageScore":0,"people":0},"AWS monitoring":{"averageScore":0,"people":0},"AWS streaming + IoT":{"averageScore":0,"people":0},"Data":{"averageScore":0,"people":0},"ML":{"averageScore":0,"people":0},"Networking":{"averageScore":0,"people":0},"Security":{"averageScore":0,"people":0},"Serverless":{"averageScore":0,"people":0},"Terraform":{"averageScore":0,"people":0}}}},{"us":{"company":"us","skills":{"C#":{"averageScore":0,"people":0},"Elixir":{"averageScore":0,"people":0},"Frontend (JS/TS)":{"averageScore":0,"people":0},"Java/Kotlin":{"averageScore":0,"people":0},"Multiplatform Mobile (ionic, react-native, flutter)":{"averageScore":0,"people":0},"Native Android":{"averageScore":0,"people":0},"Native iOS":{"averageScore":0,"people":0},"NodeJS (JS/TS)":{"averageScore":0,"people":0},"PHP":{"averageScore":2,"people":1},"Python":{"averageScore":1,"people":1},"Ruby (Rails)":{"averageScore":0,"people":0},"Rust":{"averageScore":0,"people":0},"UI Development (HTML/CSS/SCSS)":{"averageScore":0,"people":0},"AWS Cloudformation":{"averageScore":0,"people":0},"AWS ECS":{"averageScore":0,"people":0},"AWS EKS":{"averageScore":0,"people":0},"AWS cloud governance":{"averageScore":0,"people":0},"AWS core":{"averageScore":0,"people":0},"AWS finance":{"averageScore":0,"people":0},"AWS migration":{"averageScore":0,"people":0},"AWS monitoring":{"averageScore":0,"people":0},"AWS streaming + IoT":{"averageScore":0,"people":0},"Data":{"averageScore":0,"people":0},"ML":{"averageScore":0,"people":0},"Networking":{"averageScore":0,"people":0},"Security":{"averageScore":0,"people":0},"Serverless":{"averageScore":0,"people":0},"Terraform":{"averageScore":0,"people":0}}}}]
    t.same(result, expected)
})

test('read company networking skills of other', async (t) => {
    const company = 'test company'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/networking/skills',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 200)
    t.same(response.payload, "[]")
})