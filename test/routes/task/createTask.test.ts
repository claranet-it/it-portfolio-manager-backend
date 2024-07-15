import {test, beforeEach, afterEach} from 'tap'
import createApp from '@src/app'
import {FastifyInstance} from 'fastify'
import {TaskListType} from '@src/core/Task/model/task.model'
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

test('create task without authentication', async (t) => {
    const response = await app.inject({
        method: 'POST',
        url: '/api/task/task',
    })
    t.equal(response.statusCode, 401)
})

test('create new task - new insert', async (t) => {
    const customer = 'Test customer';
    const company = 'es';
    const project = 'Test project';
    const projectType = ProjectType.BILLABLE;
    const task = 'Test task';

    let response = await postTask(customer, company, project, projectType, task);
    t.equal(response.statusCode, 200)

    response = await getTask(customer, project, company);
    t.equal(response.statusCode, 200)

    const tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    const expectedResult = ['Test task']
    t.same(tasks, expectedResult)
})

test('create task with existing customer and new project - new insert', async (t) => {
    const customer = 'Test existing customer';
    const company = 'fr';
    const project = 'Test old project';
    const projectType = ProjectType.BILLABLE
    const task = 'Test task old';

    //FIRST INSERT
    let response = await postTask(customer, company, project, projectType, task);
    t.equal(response.statusCode, 200)

    response = await getTask('Test existing customer', 'Test old project', 'fr');
    t.equal(response.statusCode, 200)
    let tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    let expectedResult = ['Test task old']
    t.same(tasks, expectedResult)

    //SECOND INSERT
    response = await postTask(customer,
        company,
        'Test new project',
        ProjectType.BILLABLE,
        'Test task new');
    t.equal(response.statusCode, 200)

    // CHECK NEW
    response = await getTask(customer, 'Test new project', company)
    t.equal(response.statusCode, 200)
    tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    expectedResult = ['Test task new']
    t.same(tasks, expectedResult)

    // CHECK OLD STILL EXISTS
    response = await getTask(customer, project, 'fr')
    t.equal(response.statusCode, 200)
    tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    expectedResult = ['Test task old']
    t.same(tasks, expectedResult)
})

test('create task with existing project and new customer - new insert', async (t) => {
    const customer = 'Test old customer';
    const company = 'cr';
    const project = 'Test existing project';
    const projectType = ProjectType.NON_BILLABLE
    const task = 'Test task old';

    //FIRST INSERT
    let response = await postTask(customer, company, project, projectType, task);
    t.equal(response.statusCode, 200)

    response = await getTask(customer, project, company)
    t.equal(response.statusCode, 200)
    let tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    let expectedResult = ['Test task old']
    t.same(tasks, expectedResult)

    //SECOND INSERT
    response = await postTask(customer, company, project, projectType, task);
    response = await postTask('Test new customer',
        company,
        project,
        ProjectType.NON_BILLABLE,
        'Test task new');
    t.equal(response.statusCode, 200)

    // CHECK NEW
    response = await getTask('Test new customer', project, company)
    t.equal(response.statusCode, 200)
    tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    expectedResult = ['Test task new']
    t.same(tasks, expectedResult)

    // CHECK OLD STILL EXISTS
    response = await getTask(customer, project, company)
    t.equal(response.statusCode, 200)
    tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    expectedResult = ['Test task old']
    t.same(tasks, expectedResult)
})

test('create task with same customer and project - update', async (t) => {
    const customer = 'Test customer2';
    const company = 'de';
    const project = 'Test project2';
    const projectType = ProjectType.SLACK_TIME
    const task = 'Test task2';

    // FIRST INSERT
    let response = await postTask(customer, company, project, projectType, task);
    t.equal(response.statusCode, 200)

    response = await getTask(customer, project, company)
    t.equal(response.statusCode, 200)

    let tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    let expectedResult = ['Test task2']
    t.same(tasks, expectedResult)

    // SECOND INSERT
    response = await postTask(customer, company, project, ProjectType.SLACK_TIME, 'Test task3');
    t.equal(response.statusCode, 200)

    // CHECK TASK
    response = await getTask(customer, project, company)
    t.equal(response.statusCode, 200)
    tasks = response.json<TaskListType>()
    t.equal(tasks.length, 2)
    expectedResult = ['Test task2', 'Test task3']
    t.same(tasks, expectedResult)
})

test('create task with existing customer and project but different company - new insert', async (t) => {
    const customer = 'Test company';
    const company = 'uk';
    const project = 'company';
    const projectType = ProjectType.SLACK_TIME
    const task = 'Test';

    // INSERT UK ROW
    let response = await postTask(customer, company, project, projectType, task);
    t.equal(response.statusCode, 200)

    // INSERT US ROW
    response = await postTask(customer, 'us', project, ProjectType.SLACK_TIME, task);
    t.equal(response.statusCode, 200)

    //CHECK US TASKS
    response = await getTask(customer, project, 'us')
    t.equal(response.statusCode, 200)
    let tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    t.same(tasks, ['Test'])

    //CHECK UK TASKS
    response = await getTask(customer, project, 'uk')
    t.equal(response.statusCode, 200)
    tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    t.same(tasks, ['Test'])
})

test('throw error if # in customer', async (t) => {
    const customer = 'test#test'
    const project = 'test project'
    const projectType = ProjectType.NON_BILLABLE
    const task = 'test task'
    const company = 'it'
    const response = await postTask(customer, company, project, projectType, task)
    t.equal(response.statusCode, 400)
    t.equal(response.payload, '# is not a valid character for customer or project')
})

test('throw error if # in project', async (t) => {
    const customer = 'test'
    const project = 'test#project'
    const projectType = ProjectType.BILLABLE
    const task = 'test task'
    const company = 'it'
    const response = await postTask(customer, company, project, projectType, task)
    t.equal(response.statusCode, 400)
    t.equal(response.payload, '# is not a valid character for customer or project')
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

async function getTask(customer: string, project: string, company: string) {
    return await app.inject({
        method: 'GET',
        url: `/api/task/task/?company=${company}&customer=${customer}&project=${project}`,
        headers: {
            authorization: `Bearer ${getToken(company)}`,
        },
    })
}