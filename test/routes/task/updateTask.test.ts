import {test, beforeEach, afterEach} from 'tap'
import createApp from '@src/app'
import {FastifyInstance} from 'fastify'
import  {TaskListType} from '@src/core/Task/model/task.model'
import {ProjectType} from "@src/core/Report/model/productivity.model";

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
    const date = '2024-01-02'

    let response = await postTask(customer, company, project, projectType, task);
    t.equal(response.statusCode, 200)

    response = await addTimeEntry(
        date,
        customer,
        project,
        task,
        2,
        company,
    )
    t.equal(response.statusCode, 204)

    response = await getTask(customer, project, company)
    t.equal(response.statusCode, 200)

//    const tasks = response.json<TaskListType>()
//    t.equal(tasks.length, 1)
//    const expectedResult = ['Test update task task']
//    t.has(tasks, expectedResult)

    response = await putTask(customer, company, project, task, "Test update new task");
    t.equal(response.statusCode, 400)

    await deleteTimeEntry(date, customer, project, task, company)

//    response = await getTask(customer, project, company)
//    t.equal(response.statusCode, 200)
//    tasks = response.json<TaskListType>()
//    t.equal(tasks.length, 1)
//    expectedResult = ['Test update new task']
//    t.same(tasks, expectedResult)
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