import {test, beforeEach, afterEach} from 'tap'
import createApp from '@src/app'
import {FastifyInstance} from 'fastify'
import {TimeEntryReportListType} from "@src/core/TimeEntry/model/timeEntry.model";

let app: FastifyInstance

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
})

afterEach(async () => {
    await app.close()
})

// test('Read time entry without authorization', async (t) => {
//     const response = await app.inject({
//         method: 'GET',
//         url: '/api/time-entry/time-report?from=2024-01-01&to=2024-01-31',
//     })
//     t.equal(response.statusCode, 401)
// })

test('Generate time entries report - json', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/time-entry/time-report?from=2024-01-01&to=2024-12-31&format=json',
        headers: {
            authorization: `Bearer ${getToken()}`,
        },
    })
    t.equal(response.statusCode, 200)
    const result = response.json<TimeEntryReportListType>()
    t.equal(result.length, 10)

    const expected = [
        {
            "date": "2024-01-01",
            "email": "micol.ts@email.com",
            "name": "Micol Panetta",
            "company": "it",
            "crew": "sun",
            "customer": "Claranet",
            "project": "Assenze",
            "task": "FESTIVITA",
            "projectType": "absence",
            "hours": 1,
            "description": "",
            "startHour": "",
            "endHour": ""
        },
        {
            "date": "2024-01-01",
            "email": "micol.ts@email.com",
            "name": "Micol Panetta",
            "company": "it",
            "crew": "sun",
            "customer": "Claranet",
            "project": "Assenze",
            "task": "MALATTIA (INVIARE CERTIFICATO MEDICO)",
            "projectType": "absence",
            "hours": 1,
            "description": "",
            "startHour": "",
            "endHour": ""
        },
        {
            "date": "2024-01-01",
            "email": "micol.ts@email.com",
            "name": "Micol Panetta",
            "company": "it",
            "crew": "sun",
            "customer": "Claranet",
            "project": "Funzionale",
            "task": "Attività di portfolio",
            "projectType": "non-billable",
            "hours": 2,
            "description": "",
            "startHour": "",
            "endHour": ""
        },
        {
            "date": "2024-01-01",
            "email": "micol.ts@email.com",
            "name": "Micol Panetta",
            "company": "it",
            "crew": "sun",
            "customer": "Claranet",
            "project": "Slack time",
            "task": "formazione",
            "projectType": "slack-time",
            "hours": 2,
            "description": "",
            "startHour": "",
            "endHour": ""
        },
        {
            "date": "2024-01-01",
            "email": "micol.ts@email.com",
            "name": "Micol Panetta",
            "company": "it",
            "crew": "sun",
            "customer": "test customer",
            "project": "SOR Sviluppo",
            "task": "Iterazione 1",
            "projectType": "billable",
            "hours": 2,
            "description": "",
            "startHour": "",
            "endHour": ""
        },
        {
            "date": "2024-01-01",
            "email": "nicholas.crow@email.com",
            "name": "Nicholas Crow",
            "company": "it",
            "crew": "moon",
            "customer": "Claranet",
            "project": "Assenze",
            "task": "DONAZIONE SANGUE",
            "projectType": "absence",
            "hours": 2,
            "description": "",
            "startHour": "",
            "endHour": ""
        },
        {
            "date": "2024-01-01",
            "email": "nicholas.crow@email.com",
            "name": "Nicholas Crow",
            "company": "it",
            "crew": "moon",
            "customer": "Claranet",
            "project": "Funzionale",
            "task": "Attività di portfolio",
            "projectType": "non-billable",
            "hours": 2,
            "description": "",
            "startHour": "",
            "endHour": ""
        },
        {
            "date": "2024-01-01",
            "email": "nicholas.crow@email.com",
            "name": "Nicholas Crow",
            "company": "it",
            "crew": "moon",
            "customer": "Claranet",
            "project": "Slack time",
            "task": "formazione",
            "projectType": "slack-time",
            "hours": 4,
            "description": "",
            "startHour": "",
            "endHour": ""
        },
        {
            "date": "2024-01-31",
            "email": "micol.ts@email.com",
            "name": "Micol Panetta",
            "company": "it",
            "crew": "sun",
            "customer": "Claranet",
            "project": "Funzionale",
            "task": "Attività di portfolio",
            "projectType": "non-billable",
            "hours": 2,
            "description": "",
            "startHour": "",
            "endHour": ""
        },
        {
            "date": "2024-01-31",
            "email": "micol.ts@email.com",
            "name": "Micol Panetta",
            "company": "it",
            "crew": "sun",
            "customer": "Claranet",
            "project": "Slack time",
            "task": "formazione",
            "projectType": "slack-time",
            "hours": 2,
            "description": "",
            "startHour": "",
            "endHour": ""
        }
    ]

    t.same(result, expected)
})

test('Generate time entries report - json FILTER by crew', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/time-entry/time-report?from=2024-01-01&to=2024-12-31&format=json&crew=moon',
        headers: {
            authorization: `Bearer ${getToken()}`,
        },
    })
    t.equal(response.statusCode, 200)
    const result = response.json<TimeEntryReportListType>()
    t.equal(result.length, 3)

    const expected = [
        {
            "date": "2024-01-01",
            "email": "nicholas.crow@email.com",
            "name": "Nicholas Crow",
            "company": "it",
            "crew": "moon",
            "customer": "Claranet",
            "project": "Assenze",
            "task": "DONAZIONE SANGUE",
            "projectType": "absence",
            "hours": 2,
            "description": "",
            "startHour": "",
            "endHour": ""
        },
        {
            "date": "2024-01-01",
            "email": "nicholas.crow@email.com",
            "name": "Nicholas Crow",
            "company": "it",
            "crew": "moon",
            "customer": "Claranet",
            "project": "Funzionale",
            "task": "Attività di portfolio",
            "projectType": "non-billable",
            "hours": 2,
            "description": "",
            "startHour": "",
            "endHour": ""
        },
        {
            "date": "2024-01-01",
            "email": "nicholas.crow@email.com",
            "name": "Nicholas Crow",
            "company": "it",
            "crew": "moon",
            "customer": "Claranet",
            "project": "Slack time",
            "task": "formazione",
            "projectType": "slack-time",
            "hours": 4,
            "description": "",
            "startHour": "",
            "endHour": ""
        },
    ]

    t.same(result, expected)
})

test('Generate time entries report - json NO entries', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/time-entry/time-report?from=2023-01-01&to=2023-12-31&format=json',
        headers: {
            authorization: `Bearer ${getToken()}`,
        },
    })
    t.equal(response.statusCode, 200)
    const result = response.json<TimeEntryReportListType>()
    t.equal(result.length, 0)

    t.same(result, [])
})

test('Generate time entries report - csv', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/time-entry/time-report?from=2024-01-01&to=2024-12-31&format=csv',
        headers: {
            authorization: `Bearer ${getToken()}`,
        },
    })
    t.equal(response.statusCode, 200)

    const result = response.payload
    const expected =
        "DATE,EMAIL,NAME,COMPANY,CREW,CUSTOMER,PROJECT,TASK,PROJECT TYPE,HOURS,DESCRIPTION,START HOUR,END HOUR\n" +
        "2024-01-01,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Assenze,FESTIVITA,absence,1,,,\n" +
        "2024-01-01,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Assenze,MALATTIA (INVIARE CERTIFICATO MEDICO),absence,1,,,\n" +
        "2024-01-01,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Funzionale,Attività di portfolio,non-billable,2,,,\n" +
        "2024-01-01,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Slack time,formazione,slack-time,2,,,\n" +
        "2024-01-01,micol.ts@email.com,Micol Panetta,it,sun,test customer,SOR Sviluppo,Iterazione 1,billable,2,,,\n" +
        "2024-01-01,nicholas.crow@email.com,Nicholas Crow,it,moon,Claranet,Assenze,DONAZIONE SANGUE,absence,2,,,\n" +
        "2024-01-01,nicholas.crow@email.com,Nicholas Crow,it,moon,Claranet,Funzionale,Attività di portfolio,non-billable,2,,,\n" +
        "2024-01-01,nicholas.crow@email.com,Nicholas Crow,it,moon,Claranet,Slack time,formazione,slack-time,4,,,\n" +
        "2024-01-31,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Funzionale,Attività di portfolio,non-billable,2,,,\n" +
        "2024-01-31,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Slack time,formazione,slack-time,2,,,"
    t.same(result, expected)
})

test('Generate time entries report - csv FILTER by crew', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/time-entry/time-report?from=2024-01-01&to=2024-12-31&format=csv&crew=sun',
        headers: {
            authorization: `Bearer ${getToken()}`,
        },
    })
    t.equal(response.statusCode, 200)

    const result = response.payload
    const expected =
        "DATE,EMAIL,NAME,COMPANY,CREW,CUSTOMER,PROJECT,TASK,PROJECT TYPE,HOURS,DESCRIPTION,START HOUR,END HOUR\n" +
        "2024-01-01,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Assenze,FESTIVITA,absence,1,,,\n" +
        "2024-01-01,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Assenze,MALATTIA (INVIARE CERTIFICATO MEDICO),absence,1,,,\n" +
        "2024-01-01,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Funzionale,Attività di portfolio,non-billable,2,,,\n" +
        "2024-01-01,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Slack time,formazione,slack-time,2,,,\n" +
        "2024-01-01,micol.ts@email.com,Micol Panetta,it,sun,test customer,SOR Sviluppo,Iterazione 1,billable,2,,,\n" +
        "2024-01-31,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Funzionale,Attività di portfolio,non-billable,2,,,\n" +
        "2024-01-31,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Slack time,formazione,slack-time,2,,,"
    t.same(result, expected)
})

test('Generate time entries report - csv NO entries', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/time-entry/time-report?from=2023-01-01&to=2023-12-31&format=csv',
        headers: {
            authorization: `Bearer ${getToken()}`,
        },
    })
    t.equal(response.statusCode, 200)

    const result = response.payload
    const expected =
        "DATE,EMAIL,NAME,COMPANY,CREW,CUSTOMER,PROJECT,TASK,PROJECT TYPE,HOURS,DESCRIPTION,START HOUR,END HOUR"
    t.same(result, expected)
})