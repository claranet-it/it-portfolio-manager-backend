import {test, beforeEach, afterEach} from 'tap'
import createApp from '@src/app'
import {FastifyInstance} from 'fastify'
import {TimeEntriesForCnaListType} from "@src/core/TimeEntry/model/timeEntry.model";
import { PrismaClient } from '../../../prisma/generated'

let app: FastifyInstance
const prisma = new PrismaClient()
/* eslint-disable */
let customer: any;
/* eslint-disable */
let project: any;
/* eslint-disable */
let donazione: any;
/* eslint-disable */
let festivita: any;
/* eslint-disable */
let malattia: any;

beforeEach(async () => {
    app = createApp({logger: false})
    await app.ready()

    customer = await prisma.customer.create({
        data: {
            name: "Claranet",
            company_id: "it",
        }
    })
    project = await prisma.project.create({
        data: {
            name: "Assenze",
            customer_id: customer.id,
        }
    })
    donazione = await prisma.projectTask.create({
        data: {
            name: "DONAZIONE SANGUE",
            project_id: project.id,
        }
    })
    festivita = await prisma.projectTask.create({
        data: {
            name: "FESTIVITA",
            project_id: project.id,
        }
    })
    malattia = await prisma.projectTask.create({
        data: {
            name: "MALATTIA (INVIARE CERTIFICATO MEDICO)",
            project_id: project.id,
        }
    })
    await prisma.timeEntry.create({
        data: {
            task_id: festivita.id,
            hours: 1,
            time_entry_date: new Date('2024-01-01'),
            email: "micol.ts@email.com"
        }
    })
    await prisma.timeEntry.create({
        data: {
            task_id: malattia.id,
            hours: 1,
            time_entry_date: new Date('2024-01-01'),
            email: "micol.ts@email.com"
        }
    })
    await prisma.timeEntry.create({
        data: {
            task_id: donazione.id,
            hours: 2,
            time_entry_date: new Date('2024-01-01'),
            email: "nicholas.crow@email.com"
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

test('Read time entry without api key', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/time-entry/time-off-for-cna?company=it&month=01&year=2024',
    })
    t.equal(response.statusCode, 401)
})

test('Read time entry with invalid api key', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/time-entry/time-off-for-cna?company=it&month=01&year=2024',
        headers: {
            'X-Api-Key': `1243`,
        },
    })
    t.equal(response.statusCode, 401)
})

test('Return time entries for cna', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/time-entry/time-off-for-cna?company=it&month=01&year=2024',
        headers: {
            'X-Api-Key': `1234`,
        },
    })
    t.equal(response.statusCode, 200)
    const result = response.json<TimeEntriesForCnaListType>()
    t.equal(result.length, 3)

    const expected = [
        {
            "description": "FESTIVITA",
            "user": {
                "email": "micol.ts@email.com",
                "name": "Micol Panetta",
            },
            "userId": "micol.ts@email.com",
            "billable": false,
            "task": {
                "id": festivita.id,
                "name": "FESTIVITA",
            },
            "project": {
                "id": project.id,
                "name": "Assenze",
                "billable": false,
                "clientName": "Assenze",
            },
            "timeInterval": {
                "start": "2024-01-01",
                "end": "",
                "duration": "1",
            },
        },
        {
            "description": "MALATTIA (INVIARE CERTIFICATO MEDICO)",
            "user": {
                "email": "micol.ts@email.com",
                "name": "Micol Panetta"
            },
            "userId": "micol.ts@email.com",
            "billable": false,
            "task": {
                "id": malattia.id,
                "name": "MALATTIA (INVIARE CERTIFICATO MEDICO)"
            },
            "project": {
                "id": project.id,
                "name": "Assenze",
                "billable": false,
                "clientName": "Assenze"
            },
            "timeInterval": {
                "start": "2024-01-01",
                "end": "",
                "duration": "1"
            }
        },
        {
            "description": "DONAZIONE SANGUE",
            "user": {
                "email": "nicholas.crow@email.com",
                "name": "Nicholas Crow",
            },
            "userId": "nicholas.crow@email.com",
            "billable": false,
            "task": {
                "id": donazione.id,
                "name": "DONAZIONE SANGUE",
            },
            "project": {
                "id": project.id,
                "name": "Assenze",
                "billable": false,
                "clientName": "Assenze",
            },
            "timeInterval": {
                "start": "2024-01-01",
                "end": "",
                "duration": "2",
            },
        }
    ]
    t.same(result, expected)
})
