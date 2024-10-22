import { afterEach, beforeEach, test } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { ProductivityReportResponseType, ProjectType } from '@src/core/Report/model/productivity.model'
import { PrismaClient } from '../../../prisma/generated'

let app: FastifyInstance
const prisma = new PrismaClient()

beforeEach(async () => {
    app = createApp({logger: false})
    await app.ready()

    const claranet = await prisma.customer.create({
        data: {
            name: 'Claranet',
            company_id: 'it',
        }
    })
    const testCustomer = await prisma.customer.create({
        data: {
            name: 'test customer',
            company_id: 'it',
        }
    })
    const assenze = await prisma.project.create({
        data: {
            name: 'Assenze',
            customer_id: claranet.id,
            project_type: ProjectType.ABSENCE,
        }
    })
    const slackTime = await prisma.project.create({
        data: {
            name: 'Slack time',
            customer_id: claranet.id,
            project_type: ProjectType.SLACK_TIME,
        }
    })
    const funzionale = await prisma.project.create({
        data: {
            name: 'Funzionale',
            customer_id: claranet.id,
            project_type: ProjectType.NON_BILLABLE,
        }
    })
    const sorSviluppo = await prisma.project.create({
        data: {
            name: 'SOR Sviluppo',
            customer_id: testCustomer.id,
            project_type: ProjectType.BILLABLE,
        }
    })
    const festivita = await prisma.projectTask.create({
        data: {
            name: 'FESTIVITA',
            project_id: assenze.id,
        }
    })
    const malattia = await prisma.projectTask.create({
        data: {
            name: 'MALATTIA (INVIARE CERTIFICATO MEDICO)',
            project_id: assenze.id,
        }
    })
    const donazione = await prisma.projectTask.create({
        data: {
            name: 'DONAZIONE SANGUE',
            project_id: assenze.id,
        }
    })
    const portfolio = await prisma.projectTask.create({
        data: {
            name: 'Attività di portfolio',
            project_id: funzionale.id,
        }
    })
    const formazione = await prisma.projectTask.create({
        data: {
            name: 'formazione',
            project_id: slackTime.id,
        }
    })
    const iterazione1 = await prisma.projectTask.create({
        data: {
            name: 'Iterazione 1',
            project_id: sorSviluppo.id,
        }
    })
    await prisma.timeEntry.create({
        data: {
            task_id: festivita.id,
            hours: 1,
            email: 'micol.ts@email.com',
            time_entry_date: new Date('2024-01-01'),
        }
    })
    await prisma.timeEntry.create({
        data: {
            task_id: malattia.id,
            hours: 1,
            email: 'micol.ts@email.com',
            time_entry_date: new Date('2024-01-01'),
        }
    })
    await prisma.timeEntry.create({
        data: {
            task_id: portfolio.id,
            hours: 2,
            email: 'micol.ts@email.com',
            time_entry_date: new Date('2024-01-01'),
        }
    })
    await prisma.timeEntry.create({
        data: {
            task_id: formazione.id,
            hours: 2,
            email: 'micol.ts@email.com',
            time_entry_date: new Date('2024-01-01'),
        }
    })
    await prisma.timeEntry.create({
        data: {
            task_id: iterazione1.id,
            hours: 2,
            email: 'micol.ts@email.com',
            time_entry_date: new Date('2024-01-01'),
        }
    })
    await prisma.timeEntry.create({
        data: {
            task_id: donazione.id,
            hours: 2,
            email: 'nicholas.crow@email.com',
            time_entry_date: new Date('2024-01-01'),
        }
    })
    await prisma.timeEntry.create({
        data: {
            task_id: portfolio.id,
            hours: 2,
            email: 'nicholas.crow@email.com',
            time_entry_date: new Date('2024-01-01'),
        }
    })
    await prisma.timeEntry.create({
        data: {
            task_id: formazione.id,
            hours: 4,
            email: 'nicholas.crow@email.com',
            time_entry_date: new Date('2024-01-01'),
        }
    })
    await prisma.timeEntry.create({
        data: {
            task_id: portfolio.id,
            hours: 2,
            email: 'micol.ts@email.com',
            time_entry_date: new Date('2024-01-31'),
        }
    })
    await prisma.timeEntry.create({
        data: {
            task_id: formazione.id,
            hours: 2,
            email: 'micol.ts@email.com',
            time_entry_date: new Date('2024-01-31'),
        }
    })
})

afterEach(async () => {
    const deleteCustomer = prisma.customer.deleteMany()
    const deleteProject = prisma.project.deleteMany()
    const deleteTask = prisma.projectTask.deleteMany()
    const deleteTimeEntry = prisma.timeEntry.deleteMany()

    await prisma.$transaction([
        deleteTimeEntry,
        deleteTask,
        deleteProject,
        deleteCustomer,
    ])
    await prisma.$disconnect()
    await app.close()
})

test('read productivity report without api-key', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity-dashboard?from=2024-01-01&to=2024-01-01',
    })

    t.equal(response.statusCode, 401)
})

test('read productivity report with the wrong api-key', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity-dashboard?from=2024-01-01&to=2024-01-01',
        headers: {
            'x-api-key': `1243`,
        },
    })

    t.equal(response.statusCode, 401)
})

test('read productivity report with api-key', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity-dashboard?from=2024-01-01&to=2024-01-01',
        headers: {
            'x-api-key': `1234`,
        },
    })

    t.equal(response.statusCode, 200)
    const result = response.json<ProductivityReportResponseType>();
    const expected = [
        {
            "user":{
                "email":"resigned@email.com",
                "name":"resigned",
                "picture":"picture-url",
                "crew": "moon",
                "serviceLine": "Developer",
            },
            "workedHours":0,
            "totalTracked":{
                "billable":0,
                "non-billable":0,
                "slack-time":0,
                "absence":0
            },
            "totalProductivity":0
        },
        {
            "user":{
                "email":"micol.ts@email.com",
                "name":"Micol Panetta",
                "picture":"picture-url",
                "crew": "sun",
                "serviceLine": "Developer",
            },
            "workedHours":8,
            "totalTracked":{
                "billable":25,
                "non-billable":25,
                "slack-time":25,
                "absence":25
            },
            "totalProductivity":50
        },
        {
            "user":{
                "email":"nicholas.crow@email.com",
                "name":"Nicholas Crow",
                "picture":"picture-url",
                "crew": "moon",
                "serviceLine": "Developer",
            },
            "workedHours":8,
            "totalTracked":{
                "billable":0,
                "non-billable":25,
                "slack-time":50,
                "absence":25
            },
            "totalProductivity":25
        },
        {
            "user":{
                "email":"testIt@test.com",
                "name":"test italian",
                "picture":"",
                "crew": "bees",
                "serviceLine": "Developer",
            },
            "workedHours":0,
            "totalTracked":{
                "billable":0,
                "non-billable":0,
                "slack-time":0,
                "absence":0
            },
            "totalProductivity":0
        }
    ]

    t.same(result, expected)
})