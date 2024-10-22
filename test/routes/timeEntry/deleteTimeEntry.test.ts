import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { TimeEntryRowListType } from '@src/core/TimeEntry/model/timeEntry.model'
import { PrismaClient } from '../../../prisma/generated'
import { ProjectType } from '@src/core/Report/model/productivity.model'

let app: FastifyInstance

function getToken(): string {
  return app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it',
    role: "ADMIN",
  })
}

beforeEach(async () => {
  app = createApp({ logger: false })
  await app.ready()
})

afterEach(async () => {
  const prisma = new PrismaClient()
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

test('delete time entry without authentication', async (t) => {
  const response = await app.inject({
    method: 'DELETE',
    url: '/api/time-entry/mine',
  })
  t.equal(response.statusCode, 401)
})

test('delete time entry if index is passed', async (t) => {
  const date = '2024-01-10'
  const customer = 'Claranet'
  const project = 'Slack time'
  const task = 'formazione'
  const hours = 2
  await postTask(customer, project, task, ProjectType.SLACK_TIME)
  const addResponse = await createTimeEntry(date, customer, project, task, hours)
  t.equal(addResponse.statusCode, 204)
  const getTimeEntryResponse = await getTimeEntry(date)
  t.equal(getTimeEntryResponse.statusCode, 200)
  const timeEntry = getTimeEntryResponse.json<TimeEntryRowListType>()
  t.equal(timeEntry.length, 1)
  const deleteResponse = await app.inject({
    method: 'DELETE',
    url: '/api/time-entry/mine',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    payload: {
        date: date,
        customer: customer,
        project: project,
        task: task,
        index: timeEntry[0].index
      },
  })
  t.equal(deleteResponse.statusCode, 200)

  const getResponse = await getTimeEntry(date)
  const result = getResponse.json<TimeEntryRowListType>()
  t.same(result, [])
})

test('can\'t delete time entry if no index is passed', async (t) => {
  const date = '2024-01-10'
  const customer = 'Claranet'
  const project = 'Slack time'
  const task = 'formazione'
  const hours = 2
  await postTask(customer, project, task, ProjectType.SLACK_TIME)
  const addResponse = await createTimeEntry(date, customer, project, task, hours)
  t.equal(addResponse.statusCode, 204)
  const deleteResponse = await app.inject({
    method: 'DELETE',
    url: '/api/time-entry/mine',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    payload: {
      date: date,
      customer: customer,
      project: project,
      task: task,
    },
  })
  t.equal(deleteResponse.statusCode, 200)

  const getResponse = await getTimeEntry(date)
  const result = getResponse.json<TimeEntryRowListType>()
  t.same(result.length, 1)
})

test('delete the right time entry if there are more than one', async (t) => {
  const date = '2024-01-10'
  const customer = 'Claranet'
  const project = {name: 'Slack time', type: ProjectType.SLACK_TIME, plannedHours: 0}
  const task = 'formazione'
  await postTask(customer, project.name, task, project.type)
  const addResponse1 = await createTimeEntry(date, customer, project.name, task, 1)
  t.equal(addResponse1.statusCode, 204)
  const addResponse2 = await createTimeEntry(date, customer, project.name, task, 2)
  t.equal(addResponse2.statusCode, 204)
  let getResponse = await app.inject({
    method: 'GET',
    url: `/api/time-entry/mine?from=${date}&to=${date}`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  const timeEntries = getResponse.json<TimeEntryRowListType>()
  t.equal(timeEntries.length, 2)
  const deleteRespose = await app.inject({
    method: 'DELETE',
    url: '/api/time-entry/mine',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    payload: {
        date: date,
        customer: customer,
        project: project.name,
        task: task,
        index: timeEntries[1].index,
      },
  })
  t.equal(deleteRespose.statusCode, 200)

  getResponse = await app.inject({
    method: 'GET',
    url: `/api/time-entry/mine?from=${date}&to=${date}`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  const result = getResponse.json<TimeEntryRowListType>()
  t.same(result, [timeEntries[0]])
})

test('delete the right time entry if there are more than one by setting hours to 0', async (t) => {
  const date = '2024-01-10'
  const customer = 'Claranet'
  const project = {name: 'Slack time', type: ProjectType.SLACK_TIME, plannedHours: 0}
  const task = 'formazione'
  await postTask(customer, project.name, task, project.type)
  const addResponse1 = await createTimeEntry(date, customer, project.name, task, 1)
  t.equal(addResponse1.statusCode, 204)
  const addResponse2 = await createTimeEntry(date, customer, project.name, task, 2)
  t.equal(addResponse2.statusCode, 204)

  let getResponse = await app.inject({
    method: 'GET',
    url: `/api/time-entry/mine?from=${date}&to=${date}`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  const timeEntries = getResponse.json<TimeEntryRowListType>()
  t.equal(timeEntries.length, 2)

  const deleteRespose = await app.inject({
    method: 'POST',
    url: '/api/time-entry/mine',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    payload: {
        date: date,
        customer: customer,
        project: project.name,
        task: task,
        hours: 0,
        index: timeEntries[1].index,
      },
  })
  t.equal(deleteRespose.statusCode, 204)

  getResponse = await app.inject({
    method: 'GET',
    url: `/api/time-entry/mine?from=${date}&to=${date}`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(getResponse.statusCode, 200)
  const result = getResponse.json<TimeEntryRowListType>()
  t.equal(result.length, 1)
  t.same(result, [timeEntries[0]])
})

async function postTask(customer: string, project: string, task: string, projectType: string = 'billable') {
  return await app.inject({
    method: 'POST',
    url: '/api/task/task/',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    payload: {
      customer: customer,
      project: {name:project, type: projectType, plannedHours: 0},
      task: task
    }
  })
}

async function getTimeEntry(date: string) {
  return await app.inject({
    method: 'GET',
    url: `/api/time-entry/mine?from=${date}&to=${date}`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
}

async function createTimeEntry(date: string, customer: string, project: string, task: string, hours: number) {
  return app.inject({
    method: 'POST',
    url: '/api/time-entry/mine',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    payload: {
      date: date,
      customer: customer,
      project: project,
      task: task,
      hours: hours,
    },
  })
}
