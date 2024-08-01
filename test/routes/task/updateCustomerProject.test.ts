import {test, beforeEach, afterEach} from 'tap'
import createApp from '@src/app'
import {FastifyInstance} from 'fastify'
import {CustomerListType, ProjectDetailsType, ProjectListType} from '@src/core/Task/model/task.model'
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

test('update project - only name', async (t) => {
    const customer = 'Test update project customer';
    const company = 'Test update project company';
    const project = 'Test update project project';
    const projectType = ProjectType.NON_BILLABLE;
    const task = 'Test update project task';

    let response = await postTask(customer, company, project, projectType, task);
    t.equal(response.statusCode, 200)

    response = await getProjects(company, customer);
    t.equal(response.statusCode, 200)

    let projects = response.json<ProjectListType>()

    t.equal(projects.length, 1)
    let expectedResult = [{name: project, type: ProjectType.NON_BILLABLE, plannedHours: 0}]
    t.same(projects, expectedResult)

    const newProjectName = 'Test update NEW project project'
    response = await putProject(customer, company, {name: project, type: projectType, plannedHours: 0}, {name: newProjectName, type: projectType, plannedHours: 0});
    t.equal(response.statusCode, 200)

    response = await getProjects(company, customer);
    t.equal(response.statusCode, 200)
    projects = response.json<ProjectListType>()
    t.equal(projects.length, 1)
    expectedResult =  [{name: newProjectName, type: ProjectType.NON_BILLABLE, plannedHours: 0}]
    t.same(projects, expectedResult)
})

test('update project - only projectType', async (t) => {
    const customer = 'Test update project2 customer';
    const company = 'Test update project2 company';
    const project = 'Test update project2 project';
    const projectType = ProjectType.ABSENCE;
    const task = 'Test update project2 task';

    let response = await postTask(customer, company, project, projectType, task);
    t.equal(response.statusCode, 200)

    response = await getProjects(company, customer);
    t.equal(response.statusCode, 200)

    let projects = response.json<ProjectListType>()

    t.equal(projects.length, 1)
    let expectedResult = [{name: project, type: ProjectType.ABSENCE, plannedHours: 0}]
    t.same(projects, expectedResult)

    response = await putProject(customer, company, {name: project, type: projectType, plannedHours: 0}, {name: project, type: ProjectType.NON_BILLABLE, plannedHours: 0});
    t.equal(response.statusCode, 200)

    response = await getProjects(company, customer);
    t.equal(response.statusCode, 200)
    projects = response.json<ProjectListType>()
    t.equal(projects.length, 1)
    expectedResult =  [{name: project, type: ProjectType.NON_BILLABLE, plannedHours: 0}]
    t.same(projects, expectedResult)
})

test('update project - only plannedHours', async (t) => {
    const customer = 'Test update project3 customer';
    const company = 'Test update project3 company';
    const project = 'Test update project3 project';
    const projectType = ProjectType.ABSENCE;
    const task = 'Test update project3 task';


    let response = await postTask(customer, company, project, projectType, task);
    t.equal(response.statusCode, 200)

    response = await getProjects(company, customer);
    t.equal(response.statusCode, 200)

    let projects = response.json<ProjectListType>()

    t.equal(projects.length, 1)
    let expectedResult = [{name: project, type: ProjectType.ABSENCE, plannedHours: 0}]
    t.same(projects, expectedResult)

    const newPlannedHours = 300
    response = await putProject(customer, company, {name: project, type: projectType, plannedHours: 0}, {name: project, type: ProjectType.ABSENCE, plannedHours: newPlannedHours});
    t.equal(response.statusCode, 200)

    response = await getProjects(company, customer);
    t.equal(response.statusCode, 200)
    projects = response.json<ProjectListType>()
    t.equal(projects.length, 1)
    expectedResult =  [{name: project, type: ProjectType.ABSENCE, plannedHours: newPlannedHours}]
    t.same(projects, expectedResult)
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

async function putProject(customer: string, company: string, project: ProjectDetailsType, newProject: ProjectDetailsType) {
    return await app.inject({
        method: 'PUT',
        url: '/api/task/customer-project/',
        headers: {
            authorization: `Bearer ${getToken(company)}`,
        },
        payload: {
            customer: customer,
            project: project,
            newProject: newProject
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