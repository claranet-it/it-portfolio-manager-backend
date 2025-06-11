import {test, beforeEach, afterEach} from 'tap'
import createApp from '@src/app'
import {FastifyInstance} from 'fastify'
import { PrismaClient } from '../../../prisma/generated'
import { ProjectType } from '@src/core/Report/model/productivity.model'
import { CustomerType } from '@src/core/Task/model/task.model'

let app: FastifyInstance
const prisma = new PrismaClient()
let testCustomer: CustomerType;
let claranetCustomer: CustomerType;

// function getToken(): string {
//     return app.createTestJwt({
//         email: 'nicholas.crow@email.com',
//         name: 'Nicholas Crow',
//         picture: 'https://test.com/nicholas.crow.jpg',
//         company: 'it',
//     })
// }
beforeEach(async () => {
  app = createApp({logger: false})
  await app.ready()

  claranetCustomer = await prisma.customer.create({
    data: {
      name: 'Claranet',
      company_id: 'it',
    }
  })
  testCustomer = await prisma.customer.create({
    data: {
      name: 'test customer',
      company_id: 'it',
    }
  })
  const assenze = await prisma.project.create({
    data: {
      name: 'Assenze',
      customer_id: claranetCustomer.id,
      project_type: ProjectType.ABSENCE,
    }
  })
  const slackTime = await prisma.project.create({
    data: {
      name: 'Slack time',
      customer_id: claranetCustomer.id,
      project_type: ProjectType.SLACK_TIME,
    }
  })
  const funzionale = await prisma.project.create({
    data: {
      name: 'Funzionale',
      customer_id: claranetCustomer.id,
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
      time_entry_date: new Date('2024-01-02'),
    }
  })
  await prisma.timeEntry.create({
    data: {
      task_id: portfolio.id,
      hours: 2,
      email: 'micol.ts@email.com',
      time_entry_date: new Date('2024-01-03'),
    }
  })
  await prisma.timeEntry.create({
    data: {
      task_id: formazione.id,
      hours: 2,
      email: 'micol.ts@email.com',
      time_entry_date: new Date('2024-01-04'),
    }
  })
  await prisma.timeEntry.create({
    data: {
      task_id: iterazione1.id,
      hours: 2,
      email: 'micol.ts@email.com',
      time_entry_date: new Date('2024-01-05'),
    }
  })
  await prisma.timeEntry.create({
    data: {
      task_id: donazione.id,
      hours: 2,
      email: 'nicholas.crow@email.com',
      time_entry_date: new Date('2024-01-06'),
    }
  })
  await prisma.timeEntry.create({
    data: {
      task_id: portfolio.id,
      hours: 2,
      email: 'nicholas.crow@email.com',
      time_entry_date: new Date('2024-01-07'),
    }
  })
  await prisma.timeEntry.create({
    data: {
      task_id: formazione.id,
      hours: 4,
      email: 'nicholas.crow@email.com',
      time_entry_date: new Date('2024-01-08'),
    }
  })
  await prisma.timeEntry.create({
    data: {
      task_id: portfolio.id,
      hours: 2,
      email: 'micol.ts@email.com',
      time_entry_date: new Date('2024-01-09'),
    }
  })
  await prisma.timeEntry.create({
    data: {
      task_id: formazione.id,
      hours: 2,
      email: 'micol.ts@email.com',
      time_entry_date: new Date('2024-01-10'),
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

test('Read time entry without authorization', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/report/time-entries?from=2024-01-01&to=2024-01-31',
  })
  t.equal(response.statusCode, 401)
})
/*
test('Generate time entries report - json', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/time-entries?from=2024-01-01&to=2024-12-31&format=json',
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
            "customer": {
                id: claranetCustomer.id,
                name: claranetCustomer.name
            },
            "project": "Assenze",
            "task": "FESTIVITA",
            "projectType": "absence",
            "plannedHours": 0,
            "hours": 1,
            "description": "",
            "startHour": "",
            "endHour": ""
        },
        {
            "date": "2024-01-02",
            "email": "micol.ts@email.com",
            "name": "Micol Panetta",
            "company": "it",
            "crew": "sun",
            "customer": {
                id: claranetCustomer.id,
                name: claranetCustomer.name
            },
            "project": "Assenze",
            "task": "MALATTIA (INVIARE CERTIFICATO MEDICO)",
            "projectType": "absence",
            "plannedHours": 0,
            "hours": 1,
            "description": "",
            "startHour": "",
            "endHour": ""
        },
        {
            "date": "2024-01-03",
            "email": "micol.ts@email.com",
            "name": "Micol Panetta",
            "company": "it",
            "crew": "sun",
            "customer": {
                id: claranetCustomer.id,
                name: claranetCustomer.name
            },
            "project": "Funzionale",
            "task": "Attività di portfolio",
            "projectType": "non-billable",
            "plannedHours": 0,
            "hours": 2,
            "description": "",
            "startHour": "",
            "endHour": ""
        },
        {
            "date": "2024-01-04",
            "email": "micol.ts@email.com",
            "name": "Micol Panetta",
            "company": "it",
            "crew": "sun",
            "customer": {
                id: claranetCustomer.id,
                name: claranetCustomer.name
            },
            "project": "Slack time",
            "task": "formazione",
            "projectType": "slack-time",
            "plannedHours": 0,
            "hours": 2,
            "description": "",
            "startHour": "",
            "endHour": ""
        },
        {
            "date": "2024-01-05",
            "email": "micol.ts@email.com",
            "name": "Micol Panetta",
            "company": "it",
            "crew": "sun",
            "customer": {
                id: testCustomer.id,
                name: testCustomer.name
            },
            "project": "SOR Sviluppo",
            "task": "Iterazione 1",
            "projectType": "billable",
            "plannedHours": 0,
            "hours": 2,
            "description": "",
            "startHour": "",
            "endHour": ""
        },
        {
            "date": "2024-01-06",
            "email": "nicholas.crow@email.com",
            "name": "Nicholas Crow",
            "company": "it",
            "crew": "moon",
            "customer": {
                id: claranetCustomer.id,
                name: claranetCustomer.name
            },
            "project": "Assenze",
            "task": "DONAZIONE SANGUE",
            "projectType": "absence",
            "plannedHours": 0,
            "hours": 2,
            "description": "",
            "startHour": "",
            "endHour": ""
        },
        {
            "date": "2024-01-07",
            "email": "nicholas.crow@email.com",
            "name": "Nicholas Crow",
            "company": "it",
            "crew": "moon",
            "customer": {
                id: claranetCustomer.id,
                name: claranetCustomer.name
            },
            "project": "Funzionale",
            "task": "Attività di portfolio",
            "projectType": "non-billable",
            "plannedHours": 0,
            "hours": 2,
            "description": "",
            "startHour": "",
            "endHour": ""
        },
        {
            "date": "2024-01-08",
            "email": "nicholas.crow@email.com",
            "name": "Nicholas Crow",
            "company": "it",
            "crew": "moon",
            "customer": {
                id: claranetCustomer.id,
                name: claranetCustomer.name
            },
            "project": "Slack time",
            "task": "formazione",
            "projectType": "slack-time",
            "plannedHours": 0,
            "hours": 4,
            "description": "",
            "startHour": "",
            "endHour": ""
        },
        {
            "date": "2024-01-09",
            "email": "micol.ts@email.com",
            "name": "Micol Panetta",
            "company": "it",
            "crew": "sun",
            "customer": {
                id: claranetCustomer.id,
                name: claranetCustomer.name
            },
            "project": "Funzionale",
            "task": "Attività di portfolio",
            "projectType": "non-billable",
            "plannedHours": 0,
            "hours": 2,
            "description": "",
            "startHour": "",
            "endHour": ""
        },
        {
            "date": "2024-01-10",
            "email": "micol.ts@email.com",
            "name": "Micol Panetta",
            "company": "it",
            "crew": "sun",
            "customer": {
                id: claranetCustomer.id,
                name: claranetCustomer.name
            },
            "project": "Slack time",
            "task": "formazione",
            "projectType": "slack-time",
            "plannedHours": 0,
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
        url: '/api/report/time-entries?from=2024-01-01&to=2024-12-31&format=json&crew=moon',
        headers: {
            authorization: `Bearer ${getToken()}`,
        },
    })
    t.equal(response.statusCode, 200)
    const result = response.json<TimeEntryReportListType>()
    t.equal(result.length, 3)

    const expected = [
        {
            "date": "2024-01-06",
            "email": "nicholas.crow@email.com",
            "name": "Nicholas Crow",
            "company": "it",
            "crew": "moon",
            "customer": {
                id: claranetCustomer.id,
                name: claranetCustomer.name
            },
            "project": "Assenze",
            "task": "DONAZIONE SANGUE",
            "projectType": "absence",
            "plannedHours": 0,
            "hours": 2,
            "description": "",
            "startHour": "",
            "endHour": ""
        },
        {
            "date": "2024-01-07",
            "email": "nicholas.crow@email.com",
            "name": "Nicholas Crow",
            "company": "it",
            "crew": "moon",
            "customer": {
                id: claranetCustomer.id,
                name: claranetCustomer.name
            },
            "project": "Funzionale",
            "task": "Attività di portfolio",
            "projectType": "non-billable",
            "plannedHours": 0,
            "hours": 2,
            "description": "",
            "startHour": "",
            "endHour": ""
        },
        {
            "date": "2024-01-08",
            "email": "nicholas.crow@email.com",
            "name": "Nicholas Crow",
            "company": "it",
            "crew": "moon",
            "customer": {
                id: claranetCustomer.id,
                name: claranetCustomer.name
            },
            "project": "Slack time",
            "task": "formazione",
            "projectType": "slack-time",
            "plannedHours": 0,
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
        url: '/api/report/time-entries?from=2023-01-01&to=2023-12-31&format=json',
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
        url: '/api/report/time-entries?from=2024-01-01&to=2024-12-31&format=csv',
        headers: {
            authorization: `Bearer ${getToken()}`,
        },
    })
    t.equal(response.statusCode, 200)

    const result = response.payload
    const expected =
        "DATE,EMAIL,NAME,COMPANY,CREW,CUSTOMER,PROJECT,TASK,PROJECT TYPE,PLANNED HOURS,HOURS,DESCRIPTION,START HOUR,END HOUR\n" +
        "2024-01-01,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Assenze,FESTIVITA,absence,0,1,,,\n" +
        "2024-01-02,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Assenze,MALATTIA (INVIARE CERTIFICATO MEDICO),absence,0,1,,,\n" +
        "2024-01-03,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Funzionale,Attività di portfolio,non-billable,0,2,,,\n" +
        "2024-01-04,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Slack time,formazione,slack-time,0,2,,,\n" +
        "2024-01-05,micol.ts@email.com,Micol Panetta,it,sun,test customer,SOR Sviluppo,Iterazione 1,billable,0,2,,,\n" +
        "2024-01-06,nicholas.crow@email.com,Nicholas Crow,it,moon,Claranet,Assenze,DONAZIONE SANGUE,absence,0,2,,,\n" +
        "2024-01-07,nicholas.crow@email.com,Nicholas Crow,it,moon,Claranet,Funzionale,Attività di portfolio,non-billable,0,2,,,\n" +
        "2024-01-08,nicholas.crow@email.com,Nicholas Crow,it,moon,Claranet,Slack time,formazione,slack-time,0,4,,,\n" +
        "2024-01-09,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Funzionale,Attività di portfolio,non-billable,0,2,,,\n" +
        "2024-01-10,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Slack time,formazione,slack-time,0,2,,,"
    t.same(result, expected)
})

test('Generate time entries report - csv FILTER by crew', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/time-entries?from=2024-01-01&to=2024-12-31&format=csv&crew=sun',
        headers: {
            authorization: `Bearer ${getToken()}`,
        },
    })
    t.equal(response.statusCode, 200)

    const result = response.payload
    const expected =
        "DATE,EMAIL,NAME,COMPANY,CREW,CUSTOMER,PROJECT,TASK,PROJECT TYPE,PLANNED HOURS,HOURS,DESCRIPTION,START HOUR,END HOUR\n" +
        "2024-01-01,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Assenze,FESTIVITA,absence,0,1,,,\n" +
        "2024-01-02,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Assenze,MALATTIA (INVIARE CERTIFICATO MEDICO),absence,0,1,,,\n" +
        "2024-01-03,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Funzionale,Attività di portfolio,non-billable,0,2,,,\n" +
        "2024-01-04,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Slack time,formazione,slack-time,0,2,,,\n" +
        "2024-01-05,micol.ts@email.com,Micol Panetta,it,sun,test customer,SOR Sviluppo,Iterazione 1,billable,0,2,,,\n" +
        "2024-01-09,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Funzionale,Attività di portfolio,non-billable,0,2,,,\n" +
        "2024-01-10,micol.ts@email.com,Micol Panetta,it,sun,Claranet,Slack time,formazione,slack-time,0,2,,,"
    t.same(result, expected)
})

test('Generate time entries report - csv NO entries', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/report/time-entries?from=2023-01-01&to=2023-12-31&format=csv',
        headers: {
            authorization: `Bearer ${getToken()}`,
        },
    })
    t.equal(response.statusCode, 200)

    const result = response.payload
    const expected =
        "DATE,EMAIL,NAME,COMPANY,CREW,CUSTOMER,PROJECT,TASK,PROJECT TYPE,PLANNED HOURS,HOURS,DESCRIPTION,START HOUR,END HOUR"
    t.same(result, expected)
})

 */