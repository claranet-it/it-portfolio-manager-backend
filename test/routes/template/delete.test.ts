import { FastifyInstance } from 'fastify'
import { test, before, after } from 'tap'
import createApp from '@src/app'
import { PrismaClient } from '../../../prisma/generated'
import { getToken } from '@test/utils/token'
import { deleteTemplate } from '@test/utils/template'


let app: FastifyInstance
const prisma = new PrismaClient()

const My_EMAIL = "my-email@mail.com"

before(async () => {
    app = createApp({ logger: false })
    await app.ready()

    await prisma.template.create({
        data: {
            email: My_EMAIL,
            timehours: 8,
            daytime: "1, 3, 5",
            date_start: new Date('2025-01-02'),
            date_end: new Date('2025-02-02'),
            project_id: "project.id",
            customer_id: "customer.id",
            task_id: "task.id"
        }
    })

    await prisma.template.create({
        data: {
            email: "other-email@mail.com",
            timehours: 8,
            daytime: "1, 3, 5",
            date_start: new Date('2025-01-02'),
            date_end: new Date('2025-02-02'),
            project_id: "project.id",
            customer_id: "customer.id",
            task_id: "task.id"
        }
    })

})


after(async () => {
    const deleteTemplate = prisma.template.deleteMany()

    await prisma.$transaction([
        deleteTemplate
    ])
})

test('should return 401 deleting template without authentication', async (t) => {
    const response = await app.inject({
        method: 'DELETE',
        url: '/api/template/id',
    })
    t.equal(response.statusCode, 401)
})

test('should return 500 deleting not existing template', async (t) => {
    const seed = await prisma.template.findFirst({ where: { email: My_EMAIL } })
    if (seed) {
        const response = await deleteTemplate(app, getToken(app, My_EMAIL), "not_valid_id")
        t.equal(response.statusCode, 500)
    }
})

test('should delete template', async (t) => {
    const seed = await prisma.template.findFirst({ where: { email: My_EMAIL } })
    if (seed) {
        const response = await deleteTemplate(app, getToken(app, My_EMAIL), seed.id)
        t.equal(response.statusCode, 204)
    }

    const templates = await prisma.template.findMany()
    t.equal(templates.length, 1)
})

