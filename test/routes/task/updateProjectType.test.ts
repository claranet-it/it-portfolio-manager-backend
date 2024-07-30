import {test, beforeEach, afterEach} from 'tap'
import createApp from '@src/app'
import {FastifyInstance} from 'fastify'
import {ProjectListType} from '@src/core/Task/model/task.model'
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

test('update project type without authentication', async (t) => {
    const response = await app.inject({
        method: 'PUT',
        url: '/api/task/project-type',
    })
    t.equal(response.statusCode, 401)
})

test('update project type', async (t) => {
    const customer = 'Test update project type customer';
    const company = 'test update project type company';
    const project = 'Test update project type project';
    const projectType = ProjectType.BILLABLE;
    const task = 'Test update project type task';

    let response = await postTask(customer, company, project, projectType, task);
    t.equal(response.statusCode, 200)

    response = await getProjects(customer, project, company)
    t.equal(response.statusCode, 200)

    let projects = response.json<ProjectListType>()
    t.equal(projects.length, 1)
    let expectedResult = [{name:'Test update project type project', type: ProjectType.BILLABLE}]
    t.same(projects, expectedResult)

    response = await putProjectType(customer, company, project, ProjectType.NON_BILLABLE);
    t.equal(response.statusCode, 200)

    response = await getProjects(customer, project, company)
    t.equal(response.statusCode, 200)
    projects = response.json<ProjectListType>()
    t.equal(projects.length, 1)
    expectedResult = [{name:'Test update project type project', type: ProjectType.NON_BILLABLE}]
    t.same(projects, expectedResult)
})

async function postTask(customer: string, company: string, project: string, projectType: string, task: string) {
    return await app.inject({
        method: 'POST',
        url: '/api/task/task/',
        headers: {
            authorization: `Bearer ${getToken(company)}`,
        },
        payload: {
            customer: customer,
            project: project,
            projectType: projectType,
            task: task
        }
    })
}

async function putProjectType(customer: string, company: string, project: string, newProjectType: string) {
    return await app.inject({
        method: 'PUT',
        url: '/api/task/project-type/',
        headers: {
            authorization: `Bearer ${getToken(company)}`,
        },
        payload: {
            customer: customer,
            project: project,
            newProjectType: newProjectType,
        }
    })
}

async function getProjects(customer: string, project: string, company: string) {
    return await app.inject({
        method: 'GET',
            url: `/api/task/project?customer=${customer}`,
        headers: {
            authorization: `Bearer ${getToken(company)}`,
        },
    })
}