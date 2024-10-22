import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { TimeEntryRowListType } from '@src/core/TimeEntry/model/timeEntry.model'
import {ProjectType} from "@src/core/Report/model/productivity.model";
import { PrismaClient } from '../../../prisma/generated'

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

test('save time entry without authentication', async (t) => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/time-entry/mine',
  })
  t.equal(response.statusCode, 401)
})

test('insert time entry in new day', async (t) => {
  const date = '2024-01-02'
  const customer = 'Claranet'
  const project = 'Slack time'
  const task = 'formazione'
  const hours = 2
  await postTask(customer, project, task, ProjectType.SLACK_TIME)
  const addTimeEntryResponse = await addTimeEntry(
    date,
    customer,
    project,
    task,
    hours,
  )
  t.equal(addTimeEntryResponse.statusCode, 204)

  const getTimeEntryResponse = await app.inject({
    method: 'GET',
    url: '/api/time-entry/mine?from=2024-01-02&to=2024-01-05',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(getTimeEntryResponse.statusCode, 200)
  const timeEntry = getTimeEntryResponse.json<TimeEntryRowListType>()
  t.equal(timeEntry.length, 1)
  t.same(timeEntry[0], {
    user: 'nicholas.crow@email.com',
    company: 'it',
    date: date,
    customer: customer,
    task: task,
    project: {name: project, type: ProjectType.SLACK_TIME, plannedHours: 0},
    hours: hours,
    description: "",
    startHour: "",
    endHour: "",
    index: timeEntry[0].index,
  })
})

test('insert time entry in an existing day', async (t) => {
  const date = '2024-01-03'
  const firstCustomer = 'Claranet'
  const firstProject = 'Funzionale'
  const firstTask = 'Attività di portfolio'
  const firstHours = 2
  await postTask(firstCustomer, firstProject, firstTask, ProjectType.NON_BILLABLE)
  const firstResponse = await addTimeEntry(
    date,
    firstCustomer,
    firstProject,
    firstTask,
    firstHours,
  )
  t.equal(firstResponse.statusCode, 204)

  const secondCustomer = 'Claranet'
  const secondProject = 'Slack time'
  const secondTask = 'formazione'
  const secondHours = 5
  await postTask(secondCustomer, secondProject, secondTask, ProjectType.SLACK_TIME)

  const secondResponse = await addTimeEntry(
    date,
    secondCustomer,
    secondProject,
    secondTask,
    secondHours,
  )
  t.equal(secondResponse.statusCode, 204)

  const getTimeEntryResponse = await app.inject({
    method: 'GET',
    url: '/api/time-entry/mine?from=2024-01-03&to=2024-01-03',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(getTimeEntryResponse.statusCode, 200)
  const timeEntry = getTimeEntryResponse.json<TimeEntryRowListType>()
  t.equal(timeEntry.length, 2)
  timeEntry.forEach((timeEntry) => {timeEntry.index = 'index'})
  t.same(timeEntry, [
    {
      user: 'nicholas.crow@email.com',
      date: date,
      company: 'it',
      customer: firstCustomer,
      task: firstTask,
      project: {name: firstProject, type: ProjectType.NON_BILLABLE, plannedHours: 0},
      hours: firstHours,
      description: "",
      startHour: "",
      endHour: "",
      index: 'index',
    },
    {
      user: 'nicholas.crow@email.com',
      date: date,
      company: 'it',
      customer: secondCustomer,
      task: secondTask,
      project: {name: secondProject, type: ProjectType.SLACK_TIME, plannedHours: 0},
      hours: secondHours,
      description: "",
      startHour: "",
      endHour: "",
      index: 'index',
    },
  ])
})

test('insert time entry in an existing day with description', async (t) => {
  const date = '2024-01-08'
  const customer = 'Claranet'
  const project = 'Funzionale'
  const task = 'Attività di portfolio'
  const hours = 2
  const description = 'description'
  const startHour =  '08:00'
  const endHour =  '10:00'

  await postTask(customer, project, task, ProjectType.NON_BILLABLE)
  const firstTaskInsert = await addTimeEntry(
      date,
      customer,
      project,
      task,
      hours,
      description,
      startHour,
      endHour,
  )
  t.equal(firstTaskInsert.statusCode, 204)

  const secondDate = '2024-01-08'
  const secondCustomer = 'Claranet'
  const secondProject = 'Funzionale'
  const secondTask = 'Management'
  const secondHours = 4
  const secondDescription = 'description 2'
  const secondStartHour =  '14:00'
  const secondEndHour =  '18:00'
  await postTask(secondCustomer, secondProject, secondTask, ProjectType.NON_BILLABLE)

  const secondTaskInsert = await addTimeEntry(
      secondDate,
      secondCustomer,
      secondProject,
      secondTask,
      secondHours,
      secondDescription,
      secondStartHour,
      secondEndHour,
  )
  t.equal(secondTaskInsert.statusCode, 204)

  const getTimeEntryResponse = await app.inject({
    method: 'GET',
    url: '/api/time-entry/mine?from=2024-01-08&to=2024-01-08',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(getTimeEntryResponse.statusCode, 200)
  const timeEntry = getTimeEntryResponse.json<TimeEntryRowListType>()
  timeEntry.forEach((timeEntry) => {timeEntry.index = 'index'})
  t.equal(timeEntry.length, 2)
  t.same(timeEntry, [
    {
      user: 'nicholas.crow@email.com',
      date: date,
      company: 'it',
      customer,
      task,
      project: {name: "Funzionale", type: "non-billable", plannedHours: 0},
      hours,
      description,
      startHour,
      endHour,
      index: 'index',
    },
    {
      user: 'nicholas.crow@email.com',
      date: date,
      company: 'it',
      customer: secondCustomer,
      task: secondTask,
      project: {name: "Funzionale", type: "non-billable", plannedHours: 0},
      hours: secondHours,
      description: secondDescription,
      startHour: secondStartHour,
      endHour: secondEndHour,
      index: 'index',
    },
  ])
})

test('update hours on existing task', async(t) => {
  const date = '2024-01-04'
  const customer = 'Claranet'
  const project = 'Slack time'
  const task = 'formazione'
  const hours = 2
  await postTask(customer, project, task, ProjectType.SLACK_TIME)
  const addTimeentryResponse = await addTimeEntry(
    date,
    customer,
    project,
    task,
    hours,
  )
  t.equal(addTimeentryResponse.statusCode, 204)
  let getTimeEntryResponse = await app.inject({
    method: 'GET',
    url: '/api/time-entry/mine?from=2024-01-04&to=2024-01-04',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(getTimeEntryResponse.statusCode, 200)
  let timeEntry = getTimeEntryResponse.json<TimeEntryRowListType>()
  t.equal(timeEntry.length, 1)
  t.same(timeEntry[0].hours, hours)
  const timeEntryId = timeEntry[0].index

  const newHours = 5
  const updateTimeEntryResponse = await addTimeEntry(
    date,
    customer,
    project,
    task,
    newHours,
    "",
    "",
    "",
    timeEntryId
  )
  t.equal(updateTimeEntryResponse.statusCode, 204)
  getTimeEntryResponse = await app.inject({
    method: 'GET',
    url: '/api/time-entry/mine?from=2024-01-04&to=2024-01-04',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(getTimeEntryResponse.statusCode, 200)
  timeEntry = getTimeEntryResponse.json<TimeEntryRowListType>()
  t.equal(timeEntry.length, 1)
  t.same(timeEntry, [
    {
      user: 'nicholas.crow@email.com',
      date: date,
      company: 'it',
      customer: customer,
      task: task,
      project: {name:project, type:ProjectType.SLACK_TIME, plannedHours: 0},
      hours: newHours,
      description: "",
      startHour: "",
      endHour: "",
      index: timeEntryId,
    }    
  ])
})

test('add hours on existing task', async(t) => {
  const date = '2024-01-04'
  const customer = 'Claranet'
  const project = {name: 'Slack time', type: ProjectType.SLACK_TIME, plannedHours: 0}
  const task = 'formazione'
  const hours = 2
  await postTask(customer, project.name, task, project.type)
  const addTimeEntryResponse = await addTimeEntry(
    date,
    customer,
    project.name,
    task,
    hours,
    '',
    '09:00',
    '11:00',
  )
  t.equal(addTimeEntryResponse.statusCode, 204)

  const newHours = 5
  const updateTimeEntryResponse = await addTimeEntry(
    date,
    customer,
    project.name,
    task,
    newHours,
    '',
    '12:00',
    '17:00',
  )
  t.equal(updateTimeEntryResponse.statusCode, 204)
  const getTimeEntryResponse = await app.inject({
    method: 'GET',
    url: '/api/time-entry/mine?from=2024-01-04&to=2024-01-04',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(getTimeEntryResponse.statusCode, 200)
  const timeEntry = getTimeEntryResponse.json<TimeEntryRowListType>()
  t.equal(timeEntry.length, 2)
  timeEntry.forEach((timeEntry) => {timeEntry.index = 'index'})
  t.same(timeEntry, [
    {
      user: 'nicholas.crow@email.com',
      date: date,
      company: 'it',
      customer: customer,
      task: task,
      project: project,
      hours: hours,
      description: "",
      startHour: "09:00",
      endHour: "11:00",
      index: 'index',
    },
    {
      user: 'nicholas.crow@email.com',
      date: date,
      company: 'it',
      customer: customer,
      task: task,
      project: project,
      hours: newHours,
      description: "",
      startHour: "12:00",
      endHour: "17:00",
      index: 'index',
    }
  ])
})

test('throws error if trying to save absence on a saturday or sunday', async(t) => {
  const date = '2024-01-28'
  const customer = 'Claranet'
  const project = 'Assenze'
  const task = 'FERIE'
  const hours = 2
  await postTask(customer, project, task, ProjectType.ABSENCE)
  const addTimeEntryResponse = await addTimeEntry(
      date,
      customer,
      project,
      task,
      hours,
  )
  t.equal(addTimeEntryResponse.statusCode, 400)
  t.same(JSON.parse(addTimeEntryResponse.payload)['message'],
      'Cannot insert absence on Saturday or Sunday',
  );
})

test('returns without saving if entry has 0 hours', async(t) => {
  const date = '2024-01-27'
  const customer = 'Claranet'
  const project = 'Funzionale'
  const task = 'Attività di portfolio'
  const hours = 0
  await postTask(customer, project, task, ProjectType.NON_BILLABLE)
  const addTimeentryResponse = await addTimeEntry(
      date,
      customer,
      project,
      task,
      hours,
  )
  t.equal(addTimeentryResponse.statusCode, 204)

  const entry = await getTimeEntry('2024-01-27', '2024-01-27')
  t.equal(entry.statusCode, 200)
  const timeEntry = entry.json<TimeEntryRowListType>()
  t.equal(timeEntry.length, 0)
  t.same(timeEntry, [])
})

test('throws error on not existing customer', async(t) => {
  const date = '2024-01-02'
  const customer = 'unexisting customer'
  const project = 'test'
  const task = 'test'
  const hours = 2
  const addTimeentryResponse = await addTimeEntry(
    date,
    customer,
    project,
    task,
    hours,
  )
  t.equal(addTimeentryResponse.statusCode, 400)
  t.same(JSON.parse(addTimeentryResponse.payload)['message'],
      'Customer, project or tasks not existing',
  );
})

test('throws error on not existing project', async(t) => {
  const date = '2024-01-02'
  const customer = 'Claranet'
  const project = 'not existing'
  const task = 'test'
  const hours = 2
  const addTimeentryResponse = await addTimeEntry(
    date,
    customer,
    project,
    task,
    hours,
  )
  t.equal(addTimeentryResponse.statusCode, 400)
  t.same(JSON.parse(addTimeentryResponse.payload)['message'],
      'Customer, project or tasks not existing',
  );
})

test('throws error on not existing task', async(t) => {
  const date = '2024-01-02'
  const customer = 'Claranet'
  const project = 'Funzionale'
  const task = 'not existing'
  const hours = 2
  const addTimeentryResponse = await addTimeEntry(
    date,
    customer,
    project,
    task,
    hours,
  )
  t.equal(addTimeentryResponse.statusCode, 400)
  t.same(JSON.parse(addTimeentryResponse.payload)['message'],
      'Customer, project or tasks not existing',
  );
})

test('insert time entry with decimal hours', async (t) => {
  const date = '2024-01-02'
  const customer = 'Claranet'
  const project = 'Slack time'
  const task = 'formazione'
  const hours = 0.5
  await postTask(customer, project, task, ProjectType.SLACK_TIME)
  const addTimeEntryResponse = await addTimeEntry(
    date,
    customer,
    project,
    task,
    hours,
  )
  t.equal(addTimeEntryResponse.statusCode, 204)

  const getTimeEntryResponse = await app.inject({
    method: 'GET',
    url: '/api/time-entry/mine?from=2024-01-02&to=2024-01-05',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(getTimeEntryResponse.statusCode, 200)
  const timeEntry = getTimeEntryResponse.json<TimeEntryRowListType>()
  t.equal(timeEntry.length, 1)
  t.same(timeEntry[0], {
    user: 'nicholas.crow@email.com',
    company: 'it',
    date: date,
    customer: customer,
    task: task,
    project: {name: project, type: ProjectType.SLACK_TIME, plannedHours: 0},
    hours: hours,
    description: "",
    startHour: "",
    endHour: "",
    index: timeEntry[0].index,
  })
})

async function addTimeEntry(
  date: string,
  customer: string,
  project: string,
  task: string,
  hours: number,
  description?: string,
  startHour?: string,
  endHour?: string,
  index?: string
) {
  return await app.inject({
    method: 'POST',
    url: '/api/time-entry/mine',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    payload: {
      date,
      customer,
      project,
      task,
      hours,
      description,
      startHour,
      endHour,
      index
    },
  })
}

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

async function getTimeEntry(from: string, to: string) {
 return await app.inject({
    method: 'GET',
    url: `/api/time-entry/mine?from=${from}&to=${to}`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
}

