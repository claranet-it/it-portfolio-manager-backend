import {test, beforeEach, afterEach} from 'tap'
import createApp from '@src/app'
import {FastifyInstance} from 'fastify'
import {CustomerListType, ProjectListType} from '@src/core/Task/model/task.model'
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
    const deleteTimeEntries = prisma.timeEntry.deleteMany()

    await prisma.$transaction([
        deleteTimeEntries,
        deleteTask,
        deleteProject,
        deleteCustomer,
    ])
    await prisma.$disconnect()
    await app.close()
})

test('delete customer-project without authentication', async (t) => {
    const response = await app.inject({
        method: 'DELETE',
        url: '/api/task/customer-project',
    })
    t.equal(response.statusCode, 401)
})

test('delete customer-project', async (t) => {
    const customer = 'Test delete customer';
    const company = 'test delete company';
    const project = 'Test delete project';
    const projectType = ProjectType.BILLABLE;
    const task = 'Test delete task';

    let response = await postTask(customer, company, project, projectType, task);
    t.equal(response.statusCode, 200)

    response = await getCustomers(company);
    t.equal(response.statusCode, 200)

    let customers = response.json<CustomerListType>()
    t.equal(customers.length, 1)
    const expectedResult = ['Test delete customer']
    t.same(customers, expectedResult)

    response = await getProjects(company, customer);
    t.equal(response.statusCode, 200)

    const projects = response.json<ProjectListType>()
    t.equal(projects.length, 1)
    const projExpectedResult = [{ name: "Test delete project", type: "billable", plannedHours: 0 }]
    t.same(projects, projExpectedResult)

    response = await deleteProject(company, customer, project);
    t.equal(response.statusCode, 200)

    response = await getProjects(company, customer);
    t.equal(response.statusCode, 200)
    customers = response.json<CustomerListType>()
    t.equal(customers.length, 0)
    t.same(customers, [])
})

test('can\'t delete customer-project if there are time entries', async (t) => {
    const customer = 'Test delete customer';
    const company = 'test delete company';
    const project = 'Test delete project';
    const projectType = ProjectType.BILLABLE;
    const task = 'Test delete task';

    let response = await postTask(customer, company, project, projectType, task);
    t.equal(response.statusCode, 200)

    const addTimeEntryResponse = await app.inject({
        method: 'POST',
        url: '/api/time-entry/mine',
        headers: {
            authorization: `Bearer ${getToken(company)}`,
        },
        payload: {
          date: '2024-08-01',
          customer: customer,
          project: project,
          task: task,
          hours: 2,
        },
      })
    t.equal(addTimeEntryResponse.statusCode, 204)

    response = await getCustomers(company);
    t.equal(response.statusCode, 200)

    const customers = response.json<CustomerListType>()
    t.equal(customers.length, 1)
    const expectedResult = ['Test delete customer']
    t.same(customers, expectedResult)

    response = await getProjects(company, customer);
    t.equal(response.statusCode, 200)

    let projects = response.json<ProjectListType>()
    t.equal(projects.length, 1)
    const projExpectedResult = [{ name: "Test delete project", type: "billable", plannedHours: 0 }]
    t.same(projects, projExpectedResult)

    response = await deleteProject(company, customer, project);
    t.equal(response.statusCode, 400)

    response = await getProjects(company, customer);
    t.equal(response.statusCode, 200)
    projects = response.json<ProjectListType>()
    t.equal(projects.length, 1)
    t.same(projects, [{
      "name": "Test delete project",
      "type": "billable",
      "plannedHours": 0,
    }])
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
            project: { name: project, type: projectType, plannedHours },
            task: task
        }
    })
}

async function deleteProject(company: string, customer: string, project: string) {
    return await app.inject({
        method: 'DELETE',
        url: '/api/task/customer-project/',
        headers: {
            authorization: `Bearer ${getToken(company)}`,
        },
        payload: {
            customer: customer,
            project: project,
        }
    })
}

async function getCustomers(company: string) {
    return await app.inject({
        method: 'GET',
        url: `/api/task/customer`,
        headers: {
            authorization: `Bearer ${getToken(company)}`,
        },
    })
}

async function getProjects(company:string, customer: string) {
    return await app.inject({
        method: 'GET',
        url: `/api/task/project?customer=${customer}`,
        headers: {
            authorization: `Bearer ${getToken(company)}`,
        },
    })
}