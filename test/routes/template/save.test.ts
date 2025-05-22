import { FastifyInstance } from 'fastify'
import { test, before, after } from 'tap'
import createApp from '@src/app'
import { PrismaClient } from '../../../prisma/generated'
import { getToken } from '@test/utils/token'
import { addNewTemplate } from '@test/utils/template'

let app: FastifyInstance
const prisma = new PrismaClient()

const My_EMAIL = "my-email@mail.com"

const CUSTOMER_NAME = "Claranet";
const PROJECT_NAME = "Slack time";
const TASK_NAME = "formazione";

before(async () => {
    app = createApp({ logger: false })
    await app.ready()
    const customer = await prisma.customer.create({
        data: {
            name: CUSTOMER_NAME,
            company_id: 'it',
        }
    })

    const project = await prisma.project.create({
        data: {
            name: PROJECT_NAME,
            customer_id: customer.id
        }
    })

    await prisma.projectTask.create({
        data: {
            name: TASK_NAME,
            project_id: project.id,
        }
    })
})

after(async () => {

    const deleteTemplate = prisma.template.deleteMany()

    await prisma.$transaction([
        deleteTemplate
    ])
})

after(async () => {
    prisma.$disconnect()
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
        date_start: '2025-01-02',
        date_end: '2025-02-02',
        projectName: PROJECT_NAME,
        customerName: CUSTOMER_NAME,
        taskName: TASK_NAME
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
        projectName: PROJECT_NAME,
        customerName: CUSTOMER_NAME,
    }
    const addResponse = await addNewTemplate(app, getToken(app, My_EMAIL), payload)
    t.equal(addResponse.statusCode, 200)

    const templates = await prisma.template.findMany()
    t.equal(templates.length, 2)
    t.equal(templates[0].email, My_EMAIL)


})


test('should save my template with invalid project', async (t) => {
    const payload = {
        timehours: 8,
        daytime: [1, 3, 5],
        date_start: '2025-01-02',
        date_end: '2025-02-02',
        projectName: "Not Valid Project",
        customerName: CUSTOMER_NAME,
    }
    const addResponse = await addNewTemplate(app, getToken(app, My_EMAIL), payload)
    t.equal(addResponse.statusCode, 500)

})