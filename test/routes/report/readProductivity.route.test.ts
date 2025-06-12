import {afterEach, beforeEach, test} from 'tap'
import createApp from '@src/app'
import {FastifyInstance} from 'fastify'
import { ProjectType } from '@src/core/Report/model/productivity.model'
import { PrismaClient } from '../../../prisma/generated'

let app: FastifyInstance
const prisma = new PrismaClient()

/*function getToken(company: string): string {
    return app.createTestJwt({
        email: 'nicholas.crow@email.com',
        name: 'Nicholas Crow',
        picture: 'https://test.com/nicholas.crow.jpg',
        company: company,
    })
}*/

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

test('read productivity report without authentication', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity',
    })

    t.equal(response.statusCode, 401)
})
/*
test('read productivity report fail: startDate > endDate', async (t) => {
    const company = 'it'
    const token = getToken(company)

    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-02-01&to=2024-01-01',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 400)
    t.equal(response.body, JSON.stringify({
        message: 'End date 2024-02-01 must be greater than Start date 2024-01-01',
    }));
})

test('read productivity report: no working day', async (t) => {
    const company = 'it'
    const token = getToken(company)

    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-06&to=2024-01-06',
        headers: {
            authorization: `Bearer ${token}`,
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
                "email":"andreas.szekely@claranet.com",
                "name":"Andreas Szekely",
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
                "email":"luca.ferri@claranet.com",
                "name":"Luca Ferri",
                "picture":"picture-url",
                "crew": "polaris",
                "serviceLine": "",
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
                "email":"nicholas.crow@email.com",
                "name":"Nicholas Crow",
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
                "email":"sun@test.com",
                "name":"crew sun",
                "picture":"",
                "crew": "sun",
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

test('read productivity report: no working day with name filter', async (t) => {
    const company = 'it'
    const token = getToken(company)

    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-06&to=2024-01-06&name=Micol',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 200)
    const result = response.json<ProductivityReportResponseType>();

    t.same(result, [])
})

test('read productivity report 1 month', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-02-01',
        headers: {
            authorization: `Bearer ${token}`,
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
                "email":"andreas.szekely@claranet.com",
                "name":"Andreas Szekely",
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
            "workedHours":12,
            "totalTracked":{
                "billable":1,
                "non-billable":2,
                "slack-time":2,
                "absence":1
            },
            "totalProductivity":3
        },
        {
            "user":{
                "email":"luca.ferri@claranet.com",
                "name":"Luca Ferri",
                "picture":"picture-url",
                "crew": "polaris",
                "serviceLine": "",
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
                "email":"nicholas.crow@email.com",
                "name":"Nicholas Crow",
                "picture":"picture-url",
                "crew": "moon",
                "serviceLine": "Developer",
            },
            "workedHours":8,
            "totalTracked":{
                "billable":0,
                "non-billable":1,
                "slack-time":2,
                "absence":1
            },
            "totalProductivity":1
        },
        {
            "user":{
                "email":"sun@test.com",
                "name":"crew sun",
                "picture":"",
                "crew": "sun",
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

test('read productivity report 1 week', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-07',
        headers: {
            authorization: `Bearer ${token}`,
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
                "email":"andreas.szekely@claranet.com",
                "name":"Andreas Szekely",
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
                "billable":5,
                "non-billable":5,
                "slack-time":5,
                "absence":5
            },
            "totalProductivity":10
        },
        {
            "user":{
                "email":"luca.ferri@claranet.com",
                "name":"Luca Ferri",
                "picture":"picture-url",
                "crew": "polaris",
                "serviceLine": "",
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
                "email":"nicholas.crow@email.com",
                "name":"Nicholas Crow",
                "picture":"picture-url",
                "crew": "moon",
                "serviceLine": "Developer",
            },
            "workedHours":8,
            "totalTracked":{
                "billable":0,
                "non-billable":5,
                "slack-time":10,
                "absence":5
            },
            "totalProductivity":5
        },
        {
            "user":{
                "email":"sun@test.com",
                "name":"crew sun",
                "picture":"",
                "crew": "sun",
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

test('read productivity report 1 day', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01',
        headers: {
            authorization: `Bearer ${token}`,
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
                "email":"andreas.szekely@claranet.com",
                "name":"Andreas Szekely",
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
                "email":"luca.ferri@claranet.com",
                "name":"Luca Ferri",
                "picture":"picture-url",
                "crew": "polaris",
                "serviceLine": "",
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
                "email":"sun@test.com",
                "name":"crew sun",
                "picture":"",
                "crew": "sun",
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

test('read productivity report - only task filter => bad request', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&task=Attività di portfolio',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 400)
    t.equal(response.body, JSON.stringify({
        message: 'You must select a Customer first, then a Project and finally a Task.',
    }));
})

test('read productivity report - only project filter => bad request', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&project=Funzionale',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 400)
    t.equal(response.body, JSON.stringify({
        message: 'You must select a Customer first, then a Project and finally a Task.',
    }));
})

test('read productivity report - project and task filter => bad request', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&project=Funzionale&task=Attività di portfolio',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 400)
    t.equal(response.body, JSON.stringify({
        message: 'You must select a Customer first, then a Project and finally a Task.',
    }));
})

test('read productivity report - project & name filter => bad request', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&project=Funzionale&name=Micol',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 400)
    t.equal(response.body, JSON.stringify({
        message: 'You must select a Customer first, then a Project and finally a Task.',
    }));
})

test('read productivity report - task & name filter => bad request', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&task=Attività di portfolio&name=Micol',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 400)
    t.equal(response.body, JSON.stringify({
        message: 'You must select a Customer first, then a Project and finally a Task.',
    }));
})

test('read productivity report - project & task & name filter => bad request', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&project=Funzionale&task=Attività di portfolio&name=Micol',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 400)
    t.equal(response.body, JSON.stringify({
        message: 'You must select a Customer first, then a Project and finally a Task.',
    }));
})

test('read productivity report - customer filter', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&customer=test customer',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 200)
    const result = response.json<ProductivityReportResponseType>();
    const expected = [
        {
            "user":{
                "email":"micol.ts@email.com",
                "name":"Micol Panetta",
                "picture":"picture-url",
                "crew": "sun",
                "serviceLine": "Developer",
            },
            "workedHours":2,
            "totalTracked":{
                "billable":25,
                "non-billable":0,
                "slack-time":0,
                "absence":0
            },
            "totalProductivity":25
        },
    ]

    t.same(result, expected)
})

test('read productivity report - customer & project filter', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&customer=Claranet&project=Assenze',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 200)
    const result = response.json<ProductivityReportResponseType>();
    const expected = [
        {
            "user":{
                "email":"micol.ts@email.com",
                "name":"Micol Panetta",
                "picture":"picture-url",
                "crew": "sun",
                "serviceLine": "Developer",
            },
            "workedHours":2,
            "totalTracked":{
                "billable":0,
                "non-billable":0,
                "slack-time":0,
                "absence":25
            },
            "totalProductivity":0
        },
        {
            "user":{
                "email":"nicholas.crow@email.com",
                "name":"Nicholas Crow",
                "picture":"picture-url",
                "crew": "moon",
                "serviceLine": "Developer",
            },
            "workedHours":2,
            "totalTracked":{
                "billable":0,
                "non-billable":0,
                "slack-time":0,
                "absence":25
            },
            "totalProductivity":0
        },
    ]

    t.same(result, expected)
})

test('read productivity report - customer & project & task filter', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&customer=Claranet&project=Funzionale&task=Attività di portfolio',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 200)
    const result = response.json<ProductivityReportResponseType>();
    const expected = [
        {
            "user":{
                "email":"micol.ts@email.com",
                "name":"Micol Panetta",
                "picture":"picture-url",
                "crew": "sun",
                "serviceLine": "Developer",
            },
            "workedHours":2,
            "totalTracked":{
                "billable":0,
                "non-billable":25,
                "slack-time":0,
                "absence":0
            },
            "totalProductivity":25
        },
        {
            "user":{
                "email":"nicholas.crow@email.com",
                "name":"Nicholas Crow",
                "picture":"picture-url",
                "crew": "moon",
                "serviceLine": "Developer",
            },
            "workedHours":2,
            "totalTracked":{
                "billable":0,
                "non-billable":25,
                "slack-time":0,
                "absence":0
            },
            "totalProductivity":25
        },
    ]

    t.same(result, expected)
})

test('read productivity report - only name filter', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&name=Micol',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 200)
    const result = response.json<ProductivityReportResponseType>();
    const expected = [
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
    ]

    t.same(result, expected)
})

test('read productivity report - non-existing name filter', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&name=Pippo',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 200)
    const result = response.json<ProductivityReportResponseType>();
    t.same(result, [])
})

test('read productivity report - customer & project & task & name filter', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&customer=Claranet&project=Funzionale&task=Attività di portfolio&name=Micol',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 200)
    const result = response.json<ProductivityReportResponseType>();
    const expected = [
        {
            "user":{
                "email":"micol.ts@email.com",
                "name":"Micol Panetta",
                "picture":"picture-url",
                "crew": "sun",
                "serviceLine": "Developer",
            },
            "workedHours":2,
            "totalTracked":{
                "billable":0,
                "non-billable":25,
                "slack-time":0,
                "absence":0
            },
            "totalProductivity":25
        },
     ]

    t.same(result, expected)
})

test('read productivity report - customer & project & name filter', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&customer=Claranet&project=Funzionale&name=Micol',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 200)
    const result = response.json<ProductivityReportResponseType>();
    const expected = [
        {
            "user":{
                "email":"micol.ts@email.com",
                "name":"Micol Panetta",
                "picture":"picture-url",
                "crew": "sun",
                "serviceLine": "Developer",
            },
            "workedHours":2,
            "totalTracked":{
                "billable":0,
                "non-billable":25,
                "slack-time":0,
                "absence":0
            },
            "totalProductivity":25
        },
    ]

    t.same(result, expected)
})

test('read productivity report - name & customer filter', async (t) => {
    const company = 'it'
    const token = getToken(company)
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/productivity?from=2024-01-01&to=2024-01-01&name=Panetta&customer=test customer',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 200)
    const result = response.json<ProductivityReportResponseType>();
    const expected = [
        {
            "user":{
                "email":"micol.ts@email.com",
                "name":"Micol Panetta",
                "picture":"picture-url",
                "crew": "sun",
                "serviceLine": "Developer",
            },
            "workedHours":2,
            "totalTracked":{
                "billable":25,
                "non-billable":0,
                "slack-time":0,
                "absence":0
            },
            "totalProductivity":25
        },
    ]

    t.same(result, expected)
})

 */