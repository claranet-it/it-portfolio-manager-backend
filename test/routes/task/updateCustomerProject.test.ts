import {test, beforeEach, afterEach} from 'tap'
import createApp from '@src/app'
import {FastifyInstance} from 'fastify'
import {CustomerListType, ProjectDetailsType} from '@src/core/Task/model/task.model'
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

test('update customer without authentication', async (t) => {
    const response = await app.inject({
        method: 'PUT',
        url: '/api/task/customer-project',
    })
    t.equal(response.statusCode, 401)
})

test('update customer', async (t) => {
    const customer = 'Test update customer';
    const company = 'test update company';
    const project = 'Test update project';
    const projectType = ProjectType.BILLABLE;
    const task = 'Test update task';

    let response = await postTask(customer, company, project, projectType, task);
    t.equal(response.statusCode, 200)

    response = await getCustomers(company);
    t.equal(response.statusCode, 200)

    let customers = response.json<CustomerListType>()

    t.equal(customers.length, 1)
    let expectedResult = ['Test update customer']
    t.same(customers, expectedResult)

    response = await putCustomer(customer, company, {name: project, type: projectType, plannedHours: 0}, "Test update new customer");
    t.equal(response.statusCode, 200)

    response = await getCustomers(company);
    t.equal(response.statusCode, 200)
    customers = response.json<CustomerListType>()
    t.equal(customers.length, 1)
    expectedResult = ['Test update new customer']
    t.same(customers, expectedResult)
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

async function putCustomer(customer: string, company: string, project: ProjectDetailsType, newCustomer: string) {
    return await app.inject({
        method: 'PUT',
        url: '/api/task/customer-project/',
        headers: {
            authorization: `Bearer ${getToken(company)}`,
        },
        payload: {
            customer: customer,
            project: project,
            newCustomer: newCustomer
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