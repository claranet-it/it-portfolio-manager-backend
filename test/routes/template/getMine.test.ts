import { FastifyInstance } from 'fastify'
import { test, before, after } from 'tap'
import createApp from '@src/app'
import { PrismaClient } from '../../../prisma/generated'
import { getToken } from '@test/utils/token'
import { getMyTemplates } from '@test/utils/template'

let app: FastifyInstance
const prisma = new PrismaClient()

const My_EMAIL = "my-email@mail.com"

before(async () => {
    app = createApp({ logger: false })
    await app.ready()

    const customer = await prisma.customer.create({
        data: {
            name: 'Claranet',
            company_id: 'it',
        }
    })

    const project = await prisma.project.create({
        data: {
            name: 'Slack time',
            customer_id: customer.id
        }
    })

    const task = await prisma.projectTask.create({
        data: {
            name: 'formazione',
            project_id: project.id,
        }
    })

    await prisma.template.create({
        data: {
            email: My_EMAIL,
            timehours: 8,
            daytime: "1, 3, 5",
            date_start: new Date('2025-01-02'),
            date_end: new Date('2025-02-02'),
            project_id: project.id,
            customer_id: customer.id,
            task_id: task.id
        }
    })

    await prisma.template.create({
        data: {
            email: "other-email@mail.com",
            timehours: 8,
            daytime: "1, 3, 5",
            date_start: new Date('2025-01-02'),
            date_end: new Date('2025-02-02'),
            project_id: project.id,
            customer_id: customer.id,
            task_id: task.id
        }
    })


})

after(async () => {
    const deleteCustomer = prisma.customer.deleteMany()
    const deleteProject = prisma.project.deleteMany()
    const deleteTask = prisma.projectTask.deleteMany()
    const deleteTemplate = prisma.template.deleteMany()

    await prisma.$transaction([
        deleteTemplate,
        deleteTask,
        deleteProject,
        deleteCustomer,
    ])
})

after(async () => {
    prisma.$disconnect()
    await app.close()
})

test('should return 401 getting templates without authentication', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/template',
    })
    t.equal(response.statusCode, 401)
})

test('should return only my templates', async (t) => {
    const response = await getMyTemplates(app, getToken(app, My_EMAIL))
    const responseData = response.json()
    t.equal(response.statusCode, 200)
    t.equal(responseData.length, 1)
    t.equal(responseData[0].email, My_EMAIL)
    t.equal(responseData[0].customer, "Claranet")
    t.equal(responseData[0].project.name, "Slack time")
    t.equal(responseData[0].task.name, "formazione")
})


