import {afterEach, beforeEach, test} from 'tap'
import createApp from '@src/app'
import {FastifyInstance} from 'fastify'
import {NetworkingEffortResponseType} from "@src/core/Networking/model/networking.model";
import sinon from "sinon";
import { seedCompany } from '@test/seed/prisma/company'
import { PrismaClient } from '../../../prisma/generated'

let app: FastifyInstance
let clock: sinon.SinonFakeTimers;
const prisma = new PrismaClient()

function getToken(company: string): string {
    return app.createTestJwt({
        email: 'nicholas.crow@email.com',
        name: 'Nicholas Crow',
        picture: 'https://test.com/nicholas.crow.jpg',
        company: company,
    })
}

beforeEach(async () => {
    const fixedDate = new Date('2023-01-01T00:00:00Z');
    clock = sinon.useFakeTimers({
        now: fixedDate,
        toFake: ['Date'],
    });
    app = createApp({logger: false})
    await app.ready()
    await seedCompany()
})

afterEach(async () => {
    clock.restore();
    const deleteCompany = prisma.company.deleteMany()

    await prisma.$transaction([
        deleteCompany,
    ])
    await prisma.$disconnect()
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
    const expected = [{"cna test":[{"skill":"C#","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Elixir","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Frontend (JS/TS)","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Java/Kotlin","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Multiplatform Mobile (ionic, react-native, flutter)","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Native Android","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Native iOS","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"NodeJS (JS/TS)","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"PHP","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Python","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Ruby (Rails)","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Rust","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"UI Development (HTML/CSS/SCSS)","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS Cloudformation","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS ECS","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS EKS","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS cloud governance","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS core","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS finance","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS migration","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS monitoring","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS streaming + IoT","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Data","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"ML","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Networking","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Security","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Serverless","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Terraform","name":"cna test","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]}]},{"test company":[{"skill":"C#","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Elixir","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Frontend (JS/TS)","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Java/Kotlin","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Multiplatform Mobile (ionic, react-native, flutter)","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Native Android","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Native iOS","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"NodeJS (JS/TS)","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"PHP","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Python","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Ruby (Rails)","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Rust","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"UI Development (HTML/CSS/SCSS)","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS Cloudformation","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS ECS","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS EKS","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS cloud governance","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS core","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS finance","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS migration","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS monitoring","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS streaming + IoT","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Data","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"ML","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Networking","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Security","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Serverless","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Terraform","name":"test company","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]}]},{"us":[{"skill":"C#","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Elixir","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Frontend (JS/TS)","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Java/Kotlin","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Multiplatform Mobile (ionic, react-native, flutter)","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Native Android","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Native iOS","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"NodeJS (JS/TS)","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"PHP","name":"us","effort":[{"month_year":"01_23","people":1,"confirmedEffort":80,"tentativeEffort":0,"totalEffort":80},{"month_year":"02_23","people":1,"confirmedEffort":50,"tentativeEffort":0,"totalEffort":50},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Python","name":"us","effort":[{"month_year":"01_23","people":1,"confirmedEffort":80,"tentativeEffort":0,"totalEffort":80},{"month_year":"02_23","people":1,"confirmedEffort":50,"tentativeEffort":0,"totalEffort":50},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Ruby (Rails)","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Rust","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"UI Development (HTML/CSS/SCSS)","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS Cloudformation","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS ECS","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS EKS","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS cloud governance","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS core","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS finance","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS migration","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS monitoring","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"AWS streaming + IoT","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Data","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"ML","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Networking","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Security","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Serverless","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]},{"skill":"Terraform","name":"us","effort":[{"month_year":"01_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"02_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"03_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0},{"month_year":"04_23","people":0,"confirmedEffort":0,"tentativeEffort":0,"totalEffort":0}]}]}]
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
