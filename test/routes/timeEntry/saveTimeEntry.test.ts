import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { TimeEntryRowListType } from '@src/core/TimeEntry/model/timeEntry.model'

let app: FastifyInstance

function getToken(): string {
  return app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it'
  })
}

beforeEach(async () => {
  app = createApp({ logger: false })
  await app.ready()
})

afterEach(async () => {
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
    project: project,
    hours: hours,
    description: "",
    startHour: "",
    endHour: "",
    index: 0,
  })

  await deleteTimeEntry(date, customer, project, task, 0)
})

test('insert time entry in an existing day', async (t) => {
  const date = '2024-01-03'
  const firstCustomer = 'Claranet'
  const firstProject = 'Funzionale'
  const firstTask = 'Attività di portfolio'
  const firstHours = 2
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
  t.same(timeEntry, [
    {
      user: 'nicholas.crow@email.com',
      date: date,
      company: 'it',
      customer: firstCustomer,
      task: firstTask,
      project: firstProject,
      hours: firstHours,
      description: "",
      startHour: "",
      endHour: "",
      index: 0,
    },
    {
      user: 'nicholas.crow@email.com',
      date: date,
      company: 'it',
      customer: secondCustomer,
      task: secondTask,
      project: secondProject,
      hours: secondHours,
      description: "",
      startHour: "",
      endHour: "",
      index: 0,
    },
  ])
  await deleteTimeEntry(date, firstCustomer, firstProject, firstTask, 0)
  await deleteTimeEntry(date, secondCustomer, secondProject, secondTask, 0)
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

  const firstTaskInsert = await addTimeEntry(
      date,
      customer,
      project,
      task,
      hours,
      description,
      startHour,
      endHour,
      0
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

  const secondTaskInsert = await addTimeEntry(
      secondDate,
      secondCustomer,
      secondProject,
      secondTask,
      secondHours,
      secondDescription,
      secondStartHour,
      secondEndHour,
      1
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
  t.equal(timeEntry.length, 2)
  t.same(timeEntry, [
    {
      user: 'nicholas.crow@email.com',
      date: date,
      company: 'it',
      customer,
      task,
      project,
      hours,
      description,
      startHour,
      endHour,
      index: 0,
    },
    {
      user: 'nicholas.crow@email.com',
      date: date,
      company: 'it',
      customer: secondCustomer,
      task: secondTask,
      project: secondProject,
      hours: secondHours,
      description: secondDescription,
      startHour: secondStartHour,
      endHour: secondEndHour,
      index: 0,
    },
  ])
  await deleteTimeEntry(date, customer, project, task, 0)
  await deleteTimeEntry(date, secondCustomer, secondProject, secondTask, 0)
})

test('update hours on existing task', async(t) => {
  const date = '2024-01-04'
  const customer = 'Claranet'
  const project = 'Slack time'
  const task = 'formazione'
  const hours = 2
  const addTimeentryResponse = await addTimeEntry(
    date,
    customer,
    project,
    task,
    hours,
  )
  t.equal(addTimeentryResponse.statusCode, 204)

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
    0
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
  t.equal(timeEntry.length, 1)
  t.same(timeEntry, [
    {
      user: 'nicholas.crow@email.com',
      date: date,
      company: 'it',
      customer: customer,
      task: task,
      project: project,
      hours: newHours,
      description: "",
      startHour: "",
      endHour: "",
      index: 0,
    }    
  ])
  await deleteTimeEntry(date, customer, project, task, 0)
})

test('add hours on existing task', async(t) => {
  const date = '2024-01-04'
  const customer = 'Claranet'
  const project = 'Slack time'
  const task = 'formazione'
  const hours = 2
  const addTimeentryResponse = await addTimeEntry(
    date,
    customer,
    project,
    task,
    hours,
    '',
    '09:00',
    '11:00',
    0
  )
  t.equal(addTimeentryResponse.statusCode, 204)

  const newHours = 5
  const updateTimeEntryResponse = await addTimeEntry(
    date,
    customer,
    project,
    task,
    newHours,
    '',
    '12:00',
    '17:00',
    1
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
      index: 0,
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
      index: 1,
    }
  ])
  await deleteTimeEntry(date, customer, project, task, 1)
  await deleteTimeEntry(date, customer, project, task, 0)
})

test('throws error if trying to save absence on a saturday or sunday', async(t) => {
  const date = '2024-01-28'
  const customer = 'Claranet'
  const project = 'Assenze'
  const task = 'FERIE'
  const hours = 2
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

async function addTimeEntry(
  date: string,
  customer: string,
  project: string,
  task: string,
  hours: number,
  description?: string,
  startHour?: string,
  endHour?: string,
  index?: number
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

async function deleteTimeEntry(
  date: string,
  customer: string,
  project: string,
  task: string,
  index?: number
) {
  return await app.inject({
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
        index: index,
      },
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

