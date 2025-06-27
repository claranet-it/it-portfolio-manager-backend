import { FastifyInstance } from 'fastify'
import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { PrismaClient } from '../../../prisma/generated'
import { getToken } from '@test/utils/token'
import { addNewTemplate } from '@test/utils/template'

let app: FastifyInstance
const prisma = new PrismaClient()

const My_EMAIL = "my-email@mail.com"

let CUSTOMER_ID: string;
let PROJECT_ID: string;
let TASK_ID: string;

beforeEach(async () => {
    app = createApp({ logger: false })
    await app.ready()

    const customer = await prisma.customer.create({
        data: {
            name: 'Claranet',
            company_id: 'it',
        }
    })
    CUSTOMER_ID = customer.id
    const project = await prisma.project.create({
        data: {
            name: 'Slack time',
            customer_id: customer.id
        }
    })
    PROJECT_ID = project.id
    const task = await prisma.projectTask.create({
        data: {
            name: 'formazione',
            project_id: project.id,
        }
    })
    TASK_ID = task.id
})

afterEach(async () => {

    await prisma.template.deleteMany()
    await prisma.projectTask.deleteMany()
    await prisma.project.deleteMany()
    await prisma.customer.deleteMany()
    await app.close()
})

test('should return 401 saving templates without authentication', async (t) => {
    const response = await app.inject({
        method: 'POST',
        url: '/api/template',
    })
    t.equal(response.statusCode, 401)
})

test('should save my template', async (t) => {
    const payload = {
        timehours: 8,
        daytime: [1, 3, 5],
        date_start: '2025-01-01',
        date_end: '2025-02-02',
        project_id: PROJECT_ID,
        customer_id: CUSTOMER_ID,
        task_id: TASK_ID
    }
    const addResponse = await addNewTemplate(app, getToken(app, My_EMAIL), payload)
    t.equal(addResponse.statusCode, 200)

    const templates = await prisma.template.findMany()
    t.equal(templates.length, 1)
    t.equal(templates[0].email, My_EMAIL)


})

test('should save my template without task', async (t) => {
    const payload = {
        timehours: 8,
        daytime: [1, 3, 5],
        date_start: '2025-01-02',
        date_end: '2025-02-02',
        project_id: PROJECT_ID,
        customer_id: CUSTOMER_ID,
    }
    const addResponse = await addNewTemplate(app, getToken(app, My_EMAIL), payload)
    t.equal(addResponse.statusCode, 200)

    const templates = await prisma.template.findMany()
    t.equal(templates.length, 1)
    t.equal(templates[0].email, My_EMAIL)


})


