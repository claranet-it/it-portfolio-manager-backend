import { afterEach, beforeEach, test } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { TimeEntryRowListType } from '@src/core/TimeEntry/model/timeEntry.model'
import { ProjectType } from '@src/core/Report/model/productivity.model'

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

test('import time entry without authentication', async (t) => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/time-entry/import/csv',
  })
  t.equal(response.statusCode, 401)
})

test('import time entry', async (t) => {
  const importResponse = await app.inject({
    method: 'POST',
    url: '/api/time-entry/import/csv',
    headers: {
      authorization: `Bearer ${getToken()}`,
      'content-type': 'text/plain',
    },
    payload: 'Customer;Project;Task;User;Date;Hours;TimeStart;TimeEnd;Description\n' +
      'Claranet;Assenze;ALLATTAMENTO;nicholas.crow@email.com;2024-10-10;8;;;',
  })

  t.equal(importResponse.statusCode, 200)

  const getTimeEntryResponse = await app.inject({
    method: 'GET',
    url: '/api/report/time-entries?from=2024-10-10&to=2024-10-10&format=json',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(getTimeEntryResponse.statusCode, 200)
  const timeEntry = getTimeEntryResponse.json<TimeEntryRowListType>()
  t.equal(timeEntry.length, 1)
  t.same(timeEntry[0], {
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    company: 'it',
    date: '2024-10-10',
    customer: 'Claranet',
    task: 'ALLATTAMENTO',
    project: 'Assenze',
    projectType: ProjectType.ABSENCE,
    plannedHours: 0,
    hours: 8,
    description: "",
    startHour: "",
    endHour: "",
    crew: 'moon',
  })

  await deleteTimeEntry('2024-10-10', 'Claranet', 'Assenze', 'ALLATTAMENTO', 0)
})

test('import time entry with update', async (t) => {
  const importResponse = await app.inject({
    method: 'POST',
    url: '/api/time-entry/import/csv',
    headers: {
      authorization: `Bearer ${getToken()}`,
      'content-type': 'text/plain',
    },
    payload: 'Customer;Project;Task;User;Date;Hours;TimeStart;TimeEnd;Description\n' +
      'Claranet;Assenze;ALLATTAMENTO;nicholas.crow@email.com;2024-10-10;8;;;',
  })
  t.equal(importResponse.statusCode, 200)

  let getTimeEntryResponse = await app.inject({
    method: 'GET',
    url: '/api/report/time-entries?from=2024-10-10&to=2024-10-10&format=json',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(getTimeEntryResponse.statusCode, 200)
  let timeEntry = getTimeEntryResponse.json<TimeEntryRowListType>()
  t.equal(timeEntry.length, 1)
  t.same(timeEntry[0], {
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    company: 'it',
    date: '2024-10-10',
    customer: 'Claranet',
    task: 'ALLATTAMENTO',
    project: 'Assenze',
    projectType: ProjectType.ABSENCE,
    plannedHours: 0,
    hours: 8,
    description: "",
    startHour: "",
    endHour: "",
    crew: 'moon',
  })

  const updateResponse = await app.inject({
    method: 'POST',
    url: '/api/time-entry/import/csv',
    headers: {
      authorization: `Bearer ${getToken()}`,
      'content-type': 'text/plain',
    },
    payload: 'Customer;Project;Task;User;Date;Hours;TimeStart;TimeEnd;Description\n' +
      'Claranet;Assenze;ALLATTAMENTO;nicholas.crow@email.com;2024-10-10;4;;;',
  })
  t.equal(updateResponse.statusCode, 200)

  getTimeEntryResponse = await app.inject({
    method: 'GET',
    url: '/api/report/time-entries?from=2024-10-10&to=2024-10-10&format=json',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(getTimeEntryResponse.statusCode, 200)
  timeEntry = getTimeEntryResponse.json<TimeEntryRowListType>()
  t.equal(timeEntry.length, 1)
  t.same(timeEntry[0], {
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    company: 'it',
    date: '2024-10-10',
    customer: 'Claranet',
    task: 'ALLATTAMENTO',
    project: 'Assenze',
    projectType: ProjectType.ABSENCE,
    plannedHours: 0,
    hours: 4,
    description: "",
    startHour: "",
    endHour: "",
    crew: 'moon',
  })

  await deleteTimeEntry('2024-10-10', 'Claranet', 'Assenze', 'ALLATTAMENTO', 0)
})

test('import time entry with delete', async (t) => {
  const importResponse = await app.inject({
    method: 'POST',
    url: '/api/time-entry/import/csv',
    headers: {
      authorization: `Bearer ${getToken()}`,
      'content-type': 'text/plain',
    },
    payload: 'Customer;Project;Task;User;Date;Hours;TimeStart;TimeEnd;Description\n' +
      'Claranet;Assenze;ALLATTAMENTO;nicholas.crow@email.com;2024-10-10;8;;;',
  })
  t.equal(importResponse.statusCode, 200)

  let getTimeEntryResponse = await app.inject({
    method: 'GET',
    url: '/api/report/time-entries?from=2024-10-10&to=2024-10-10&format=json',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(getTimeEntryResponse.statusCode, 200)
  let timeEntry = getTimeEntryResponse.json<TimeEntryRowListType>()
  t.equal(timeEntry.length, 1)
  t.same(timeEntry[0], {
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    company: 'it',
    date: '2024-10-10',
    customer: 'Claranet',
    task: 'ALLATTAMENTO',
    project: 'Assenze',
    projectType: ProjectType.ABSENCE,
    plannedHours: 0,
    hours: 8,
    description: "",
    startHour: "",
    endHour: "",
    crew: 'moon',
  })

  const updateResponse = await app.inject({
    method: 'POST',
    url: '/api/time-entry/import/csv',
    headers: {
      authorization: `Bearer ${getToken()}`,
      'content-type': 'text/plain',
    },
    payload: 'Customer;Project;Task;User;Date;Hours;TimeStart;TimeEnd;Description\n' +
      'Claranet;Assenze;ALLATTAMENTO;nicholas.crow@email.com;2024-10-10;0;;;',
  })
  t.equal(updateResponse.statusCode, 200)

  getTimeEntryResponse = await app.inject({
    method: 'GET',
    url: '/api/report/time-entries?from=2024-10-10&to=2024-10-10&format=json',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(getTimeEntryResponse.statusCode, 200)
  timeEntry = getTimeEntryResponse.json<TimeEntryRowListType>()
  t.equal(timeEntry.length, 0)
})

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

