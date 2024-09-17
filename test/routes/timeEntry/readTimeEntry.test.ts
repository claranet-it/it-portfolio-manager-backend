import {test, beforeEach, afterEach} from 'tap'
import createApp from '@src/app'
import {FastifyInstance} from 'fastify'
import {TimeEntryRowListType} from '@src/core/TimeEntry/model/timeEntry.model'
import { PrismaClient } from '../../../prisma/generated'
import { ProjectType } from '@src/core/Report/model/productivity.model'

let app: FastifyInstance
const prisma = new PrismaClient()

function getToken(): string {
    return app.createTestJwt({
        email: 'nicholas.crow@email.com',
        name: 'Nicholas Crow',
        picture: 'https://test.com/nicholas.crow.jpg',
        company: 'it',
    })
}

beforeEach(async () => {
    app = createApp({logger: false})
    await app.ready()

    const claranet = await prisma.customer.create({
        data: {
            name: 'Claranet',
            company_id: 'it',
        }
    })
    const funzionale = await prisma.project.create({
        data: {
            name: 'Funzionale',
            customer_id: claranet.id,
            project_type: ProjectType.NON_BILLABLE
        }
    })
    const slackTime = await prisma.project.create({
        data: {
            name: 'Slack time',
            customer_id: claranet.id,
            project_type: ProjectType.SLACK_TIME
        }
    })
    const assenze = await prisma.project.create({
        data: {
            name: 'Assenze',
            customer_id: claranet.id,
            project_type: ProjectType.ABSENCE
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
    const donazione = await prisma.projectTask.create({
        data: {
            name: 'DONAZIONE SANGUE',
            project_id: assenze.id,
        }
    })
    await prisma.timeEntry.create({
        data: {
            task_id: portfolio.id,
            hours: 2,
            time_entry_date: new Date('2024-01-01'),
            email: 'nicholas.crow@email.com'
        }
    })
    await prisma.timeEntry.create({
        data: {
            task_id: formazione.id,
            hours: 4,
            time_entry_date: new Date('2024-01-01'),
            email: 'nicholas.crow@email.com'
        }
    })
    await prisma.timeEntry.create({
        data: {
            task_id: donazione.id,
            hours: 2,
            time_entry_date: new Date('2024-01-01'),
            email: 'nicholas.crow@email.com'
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

test('Read time entry without authentication', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/time-entry/mine?from=2024-01-01&to2024-01-10',
    })
    t.equal(response.statusCode, 401)
})

test('Return empty array on no entries in date range', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/time-entry/mine?from=2025-01-01&to=2025-01-10',
        headers: {
            authorization: `Bearer ${getToken()}`,
        },
    })
    t.equal(response.statusCode, 200)
    const result = response.json<TimeEntryRowListType>()
    t.same(result, [])
})

test('Return time entries', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/time-entry/mine?from=2024-01-01&to=2024-01-01',
        headers: {
            authorization: `Bearer ${getToken()}`,
        },
    })
    t.equal(response.statusCode, 200)
    const result = response.json<TimeEntryRowListType>()
    t.equal(result.length, 3)
    result.forEach((entry) => { entry.index = 'index' })
    t.same(result, [
        {
            user: 'nicholas.crow@email.com',
            date: '2024-01-01',
            company: 'it',
            customer: 'Claranet',
            project: {
                name: "Funzionale",
                type: "non-billable",
                plannedHours: 0
            },
            task: 'Attività di portfolio',
            hours: 2,
            description: "",
            startHour: "",
            endHour: "",
            index: 'index',
        },
        {
            user: 'nicholas.crow@email.com',
            date: '2024-01-01',
            company: 'it',
            customer: 'Claranet',
            project: {
                name: "Slack time",
                type: "slack-time",
                plannedHours: 0
            },
            task: 'formazione',
            hours: 4,
            description: "",
            startHour: "",
            endHour: "",
            index: 'index',
        },
        {
            user: 'nicholas.crow@email.com',
            date: '2024-01-01',
            company: 'it',
            customer: 'Claranet',
            project: {
                name: "Assenze",
                type: "absence",
                plannedHours: 0
            },
            task: 'DONAZIONE SANGUE',
            hours: 2,
            description: "",
            startHour: "",
            endHour: "",
            index: 'index',
        },
    ])
})
