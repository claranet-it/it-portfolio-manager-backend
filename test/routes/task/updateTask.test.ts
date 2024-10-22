import { afterEach, beforeEach, test } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { TaskListType } from '@src/core/Task/model/task.model'
import { ProjectType } from '@src/core/Report/model/productivity.model'
import { TimeEntryRowListType } from '@src/core/TimeEntry/model/timeEntry.model'
import { PrismaClient } from '../../../prisma/generated'

let app: FastifyInstance

function getToken(company: string): string {
    return app.createTestJwt({
      email: 'nicholas.crow@email.com',
      name: 'Nicholas Crow',
      picture: 'https://test.com/nicholas.crow.jpg',
      company: company,
      role: "ADMIN",
    })
}

beforeEach(async () => {
    app = createApp({logger: false})
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

test('update task without authentication', async (t) => {
    const response = await app.inject({
        method: 'PUT',
        url: '/api/task/task',
    })
    t.equal(response.statusCode, 401)
})

test('update task - ok', async (t) => {
    const customer = 'Test update task customer';
    const company = 'test update task company';
    const project = 'Test update task project';
    const projectType = ProjectType.BILLABLE;
    const task = 'Test update task task';

    let response = await postTask(customer, company, project, projectType, task);
    t.equal(response.statusCode, 200)

    response = await getTask(customer, project, company)
    t.equal(response.statusCode, 200)

    let tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    let expectedResult = [
        {
            name: 'Test update task task',
            completed: false,
            plannedHours: 0,
        }]
    t.same(tasks, expectedResult)

    response = await putTask(customer, company, project, task, "Test update new task");
    t.equal(response.statusCode, 200)

    response = await getTask(customer, project, company)
    t.equal(response.statusCode, 200)
    tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    expectedResult = [{
        name: 'Test update new task',
        completed: false,
        plannedHours: 0,
    }]
    t.same(tasks, expectedResult)


})

test('update task with time entries assigned', async (t) => {
    const customer = 'Test update task customer';
    const company = 'test update task company';
    const project = 'Test update task project';
    const projectType = ProjectType.BILLABLE;
    const task = 'Test update task task';
    const date = '2024-09-02'

    let response = await postTask(customer, company, project, projectType, task);
    t.equal(response.statusCode, 200)

    response = await addTimeEntry(
        date,
        customer,
        project,
        task,
        2,
        company,
        '',
        '00:00',
        '00:00',
    )
    t.equal(response.statusCode, 204)

    response = await getTask(customer, project, company)
    t.equal(response.statusCode, 200)

    let tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    let expectedResult = [
      {
        name: 'Test update task task',
        completed: false,
        plannedHours: 0,
      }
    ]
    t.has(tasks, expectedResult)

    response = await getTimeEntry(date, date, company)
    t.equal(response.statusCode, 200)
    const timeEntriesBefore = response.json<TimeEntryRowListType>()
    t.equal(timeEntriesBefore.length, 1)
    t.same(task, timeEntriesBefore[0].task)

    response = await putTask(customer, company, project, task, "Test updated task");
    t.equal(response.statusCode, 200)

    response = await getTask(customer, project, company)
    t.equal(response.statusCode, 200)
    tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    expectedResult = [
      {
        name: 'Test updated task',
        completed: false,
        plannedHours: 0,
      }
    ]
    t.same(tasks, expectedResult)

    response = await getTimeEntry(date, date, company)
    t.equal(response.statusCode, 200)
    const timeEntriesAfter = response.json<TimeEntryRowListType>()
    t.equal(timeEntriesAfter.length, 1)
    t.same(timeEntriesBefore[0].hours, timeEntriesAfter[0].hours)
    t.same(timeEntriesBefore[0].startHour, timeEntriesAfter[0].startHour)
    t.same(timeEntriesBefore[0].endHour, timeEntriesAfter[0].endHour)
    t.same(timeEntriesBefore[0].description, timeEntriesAfter[0].description)
    t.same(timeEntriesBefore[0].user, timeEntriesAfter[0].user)
    t.same(timeEntriesBefore[0].date, timeEntriesAfter[0].date)
    t.same(timeEntriesBefore[0].index, timeEntriesAfter[0].index)
    t.same("Test updated task", timeEntriesAfter[0].task)
})

async function postTask(customer: string, company: string, project: string, projectType: string, task: string, plannedHours?: string) {
    return await app.inject({
        method: 'POST',
        url: '/api/task/task/',
        headers: {
            authorization: `Bearer ${getToken(company)}`,
        },
        payload: {
            customer: customer,
            project: {name:project, type: projectType, plannedHours: plannedHours},
            task: task
        }
    })
}

async function putTask(customer: string, company: string, project: string, task: string, newTask: string) {
    return await app.inject({
        method: 'PUT',
        url: '/api/task/task/',
        headers: {
            authorization: `Bearer ${getToken(company)}`,
        },
        payload: {
            customer: customer,
            project: project,
            task: task,
            newTask: newTask,
        }
    })
}

async function getTask(customer: string, project: string, company: string) {
    return await app.inject({
        method: 'GET',
        url: `/api/task/task/?company=${company}&customer=${customer}&project=${project}`,
        headers: {
            authorization: `Bearer ${getToken(company)}`,
        },
    })
}

async function addTimeEntry(
    date: string,
    customer: string,
    project: string,
    task: string,
    hours: number,
    company: string,
    description?: string,
    startHour?: string,
    endHour?: string,
    index?: number,
  ) {
    return await app.inject({
      method: 'POST',
      url: '/api/time-entry/mine',
      headers: {
        authorization: `Bearer ${getToken(company)}`,
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

async function getTimeEntry(from: string, to: string, company: string) {
    return await app.inject({

      method: 'GET',
      url: `/api/time-entry/mine?from=${from}&to=${to}`,
      headers: {
        authorization: `Bearer ${getToken(company)}`,
      },
    })
}
