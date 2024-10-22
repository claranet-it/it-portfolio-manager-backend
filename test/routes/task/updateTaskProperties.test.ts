import {test, beforeEach, afterEach} from 'tap'
import createApp from '@src/app'
import {FastifyInstance} from 'fastify'
import {TaskListType} from '@src/core/Task/model/task.model'
import {ProjectType} from "@src/core/Report/model/productivity.model";
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

test('create task properties without authentication', async (t) => {
    const response = await app.inject({
        method: 'POST',
        url: '/api/task/task-properties',
    })
    t.equal(response.statusCode, 401)
})

test('create new task properties', async (t) => {
    const customer = 'Test customer';
    const company = 'it';
    const project = 'Test project';
    const completed = true;
    const plannedHours = 200;
    const task = 'Test task';

    await postTask(customer, company, project, task, ProjectType.BILLABLE, plannedHours)

    let response = await getTask(customer, project, company);
    t.equal(response.statusCode, 200)

    const results = response.json<TaskListType>()
    t.equal(results.length, 1)
    t.same(results, [{
        name: 'Test task',
        completed: false,
        plannedHours: 0,
    }])

    response = await postTaskProperties(customer, company, project, task, completed, plannedHours);
    t.equal(response.statusCode, 200)

    response = await getTask(customer, project, company);
    t.equal(response.statusCode, 200)

    const tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    const expectedResult = [{
        name: 'Test task',
        completed: true,
        plannedHours: 200,
    }]
    t.same(tasks, expectedResult)
})

test('update task properties', async (t) => {
    const customer = 'Test customer2';
    const company = 'it';
    const project = 'Test project2';
    const task = 'Test task2';
    const completed = true;
    const plannedHours = 200;
    const updatedPlannedHours = 100;

    await postTask(customer, company, project, task, ProjectType.BILLABLE, plannedHours)

    let response = await getTask(customer, project, company);
    t.equal(response.statusCode, 200)

    const results = response.json<TaskListType>()
    t.equal(results.length, 1)
    t.same(results, [{
        name: 'Test task2',
        completed: false,
        plannedHours: 0,
    }])

    response = await postTaskProperties(customer, company, project, task, completed, plannedHours);
    t.equal(response.statusCode, 200)

    response = await getTask(customer, project, company);
    t.equal(response.statusCode, 200)

    const tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    const expectedResult = [{
        name: 'Test task2',
        completed: true,
        plannedHours: 200,
    }]
    t.same(tasks, expectedResult)

    response = await postTaskProperties(customer, company, project, task, completed, updatedPlannedHours);
    t.equal(response.statusCode, 200)

    response = await getTask(customer, project, company);
    t.equal(response.statusCode, 200)

    const tasks2 = response.json<TaskListType>()
    t.equal(tasks2.length, 1)
    const expectedResult2 = [{
        name: 'Test task2',
        completed: true,
        plannedHours: 100,
    }]
    t.same(tasks2, expectedResult2)
})

async function postTask(customer: string, company: string, project: string, task: string, projectType?: string, plannedHours?: number) {
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

async function postTaskProperties(customer: string, company: string, project: string, task: string, completed?: boolean, plannedHours?: number) {
    return await app.inject({
        method: 'POST',
        url: '/api/task/task-properties',
        headers: {
            authorization: `Bearer ${getToken(company)}`,
        },
        payload: {
            customer: customer,
            project: project,
            task: task,
            completed: completed,
            plannedHours: plannedHours
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