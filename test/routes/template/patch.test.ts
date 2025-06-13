import { FastifyInstance } from 'fastify'
import { test, before, after } from 'tap'
import createApp from '@src/app'
import { PrismaClient } from '../../../prisma/generated'
import { getToken } from '@test/utils/token'
import { updateTemplate } from '@test/utils/template'


let app: FastifyInstance
const prisma = new PrismaClient()

const FAKE_EMAIL = "test@email.com"

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
            email: FAKE_EMAIL,
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
    const deleteTemplate = prisma.template.deleteMany()

    await prisma.$transaction([
        deleteTemplate
    ])
})

test('should return 401 update template without authentication', async (t) => {
    const response = await app.inject({
        method: 'PATCH',
        url: '/api/template/id',
    })
    t.equal(response.statusCode, 401)
})

test('should not update email in template', async (t) => {
    const seed = await prisma.template.findFirst({ where: { email: FAKE_EMAIL } })
    if (seed) {
        // @ts-expect-error test email not change
        await updateTemplate(app, getToken(app, FAKE_EMAIL), seed.id, { email: "Marytex" })
        const template = await prisma.template.findFirst({ where: { id: seed.id } })
        t.equal(template?.email, FAKE_EMAIL)
    }
})

test('should update items of my template', async (t) => {
    const seed = await prisma.template.findFirst({ where: { email: FAKE_EMAIL } })
    if (seed) {
        await updateTemplate(app, getToken(app, FAKE_EMAIL), seed.id, {
            timehours: 3, daytime: [2]
        })
    }

    const template = await prisma.template.findFirst({ where: { email: FAKE_EMAIL } })

    t.equal(template?.timehours, 3)
    t.equal(template?.daytime, '2')
})




