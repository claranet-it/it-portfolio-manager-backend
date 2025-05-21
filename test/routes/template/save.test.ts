import { FastifyInstance } from 'fastify'
import { test, before, after } from 'tap'
import createApp from '@src/app'
import { PrismaClient } from '../../../prisma/generated'
import { getToken } from '@test/utils/token'
import { addNewTemplate } from '@test/utils/template'

let app: FastifyInstance
const prisma = new PrismaClient()

const My_EMAIL = "my-email@mail.com"

const CUSTOMER_ID = "customerId";
const PROJECT_ID = "projectId";
const TASK_ID = "taskId";

before(async () => {
    app = createApp({ logger: false })
    await app.ready()

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

test('should return my templates', async (t) => {
    const payload = {
        timehours: 8,
        daytime: [1, 3, 5],
        date_start: '2025-01-02',
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


