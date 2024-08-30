import {test, beforeEach, afterEach} from 'tap'
import createApp from '@src/app'
import {FastifyInstance} from 'fastify'
import  {TaskListType} from '@src/core/Task/model/task.model'
import {ProjectType} from "@src/core/Report/model/productivity.model";
import { TimeEntryRowListType } from '@src/core/TimeEntry/model/timeEntry.model'

let app: FastifyInstance

function getToken(company: string): string {
    return app.createTestJwt({
        email: 'nicholas.crow@email.com',
        name: 'Nicholas Crow',
        picture: 'https://test.com/nicholas.crow.jpg',
        company: company
    })
}

beforeEach(async () => {
    app = createApp({logger: false})
    await app.ready()
})

afterEach(async () => {
    await app.close()
})

test('update task without authentication', async (t) => {
    const response = await app.inject({
        method: 'PUT',
        url: '/api/task/task',
    })
    t.equal(response.statusCode, 401)
})

test('update task', async (t) => {
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
    t.equal(tasks.length, 2)
    let expectedResult = ['Test update new task', 'Test update task task']
    t.has(tasks, expectedResult)

    response = await getTimeEntry(date, date, company)
    let timeEntries = response.json<TimeEntryRowListType>()
    t.equal(timeEntries.length, 1)
    t.same(timeEntries, [
        {
            "user": "nicholas.crow@email.com",
            "date": "2024-09-02",
            "company": "test update task company",
            "customer": "Test update task customer",
            "project":{
                "name": "Test update task project",
                "type": "billable",
                "plannedHours": 0,
            },
            "task": "Test update task task",
            "hours": 2,
            "description": "",
            "startHour": "00:00",
            "endHour": "00:00",
            "index": 0,
        },
    ])

    response = await putTask(customer, company, project, task, "Test updated task");
    t.equal(response.statusCode, 200)

    response = await getTask(customer, project, company)
    t.equal(response.statusCode, 200)
    tasks = response.json<TaskListType>()
    t.equal(tasks.length, 2)
    expectedResult = ['Test update new task', 'Test updated task']
    t.same(tasks, expectedResult)

    response = await getTimeEntry(date, date, company)
    timeEntries = response.json<TimeEntryRowListType>()
    t.equal(timeEntries.length, 1)
    t.same(timeEntries, [
        {
            "user": "nicholas.crow@email.com",
            "date": "2024-09-02",
            "company": "test update task company",
            "customer": "Test update task customer",
            "project":{
                "name": "Test update task project",
                "type": "billable",
                "plannedHours": 0,
            },
            "task": "Test updated task",
            "hours": 2,
            "description": "",
            "startHour": "00:00",
            "endHour": "00:00",
            "index": 0,
        },
    ])

    await deleteTimeEntry(date, customer, project, task, company)
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
  async function deleteTimeEntry(
      date: string,
      customer: string,
      project: string,
      task: string,
      company: string,
      index?: number
    ) {
      return await app.inject({
        method: 'DELETE',
        url: '/api/time-entry/mine',
        headers: {
          authorization: `Bearer ${getToken(company)}`,
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