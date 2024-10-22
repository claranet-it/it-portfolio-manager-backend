import { afterEach, beforeEach, test } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import {
  CustomerListType,
  ProjectDetailsType,
  ProjectListType,
} from '@src/core/Task/model/task.model'
import { PrismaClient } from '../../../prisma/generated'
import { ProjectType } from '@src/core/Report/model/productivity.model'

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

    await prisma.$transaction([
        deleteTask,
        deleteProject,
        deleteCustomer,
    ])
    await prisma.$disconnect()
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

test('update project - all', async (t) => {
    const customer = 'Test update project all customer';
    const company = 'Test update project all company';
    const project = 'Test update project all project';
    const projectType = ProjectType.SLACK_TIME;
    const plannedHours = 200;
    const task = 'Test update project all task';

    let response = await postTask(customer, company, project, projectType, task, plannedHours);
    t.equal(response.statusCode, 200)

    response = await getProjects(company, customer);
    t.equal(response.statusCode, 200)

    let projects = response.json<ProjectListType>()

    t.equal(projects.length, 1)
    let expectedResult: {name: string, type: ProjectType, plannedHours: number}[] = [{name: project, type: ProjectType.SLACK_TIME, plannedHours: plannedHours}]
    t.same(projects, expectedResult)

    const newProjectName = 'Test update NEW project all project'
    const newProjectType = ProjectType.BILLABLE
    const newPlannedHours = 300
    response = await putProject(customer, company, {name: project, type: projectType, plannedHours: plannedHours}, {name: newProjectName, type: newProjectType, plannedHours: newPlannedHours});
    t.equal(response.statusCode, 200)

    response = await getProjects(company, customer);
    t.equal(response.statusCode, 200)
    projects = response.json<ProjectListType>()
    t.equal(projects.length, 1)
    expectedResult =  [{name: newProjectName, type: newProjectType, plannedHours: newPlannedHours}]
    t.same(projects, expectedResult)
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
    let expectedResult: {name: string, type: ProjectType, plannedHours: number}[] = [{name: project, type: ProjectType.ABSENCE, plannedHours: 0}]
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

test('update project - plannedHours = 0', async (t) => {
    const customer = 'Test update project3 customer';
    const company = 'Test update project3 company';
    const project = 'Test update project3 project';
    const projectType = ProjectType.ABSENCE;
    const task = 'Test update project3 task';


    let response = await postTask(customer, company, project, projectType, task, 300);
    t.equal(response.statusCode, 200)

    response = await getProjects(company, customer);
    t.equal(response.statusCode, 200)

    let projects = response.json<ProjectListType>()

    t.equal(projects.length, 1)
    let expectedResult = [{name: project, type: ProjectType.ABSENCE, plannedHours: 300}]
    t.same(projects, expectedResult)

    const newPlannedHours = 0
    response = await putProject(customer, company, {name: project, type: projectType, plannedHours: 300}, {name: project, type: ProjectType.ABSENCE, plannedHours: newPlannedHours});
    t.equal(response.statusCode, 200)

    response = await getProjects(company, customer);
    t.equal(response.statusCode, 200)
    projects = response.json<ProjectListType>()
    t.equal(projects.length, 1)
    expectedResult =  [{name: project, type: ProjectType.ABSENCE, plannedHours: newPlannedHours}]
    t.same(projects, expectedResult)
})

async function postTask(customer: string, company: string, project: string, projectType: string, task: string, plannedHours?: number) {
    return await app.inject({
        method: 'POST',
        url: '/api/task/task/',
        headers: {
            authorization: `Bearer ${getToken(company)}`,
        },
        payload: {
            customer: customer,
            project: {name: project, type: projectType, plannedHours: plannedHours},
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