import { afterEach, beforeEach, test } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { TaskListType } from '@src/core/Task/model/task.model'
import { ProjectType } from '@src/core/Report/model/productivity.model'
import { PrismaClient } from '../../../prisma/generated'

let app: FastifyInstance
const prisma = new PrismaClient()

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
    const plannedHours = 200;
    const task = 'Test task';

    let response = await postTask(customer, company, project, task, projectType, plannedHours);
    t.equal(response.statusCode, 200)

    response = await getTask(customer, project, company);
    t.equal(response.statusCode, 200)

    const tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    const expectedResult = [{
        name: 'Test task',
        completed: false,
        plannedHours: 0,
    }]
    t.same(tasks, expectedResult)
})

test('create task with existing customer and new project - new insert', async (t) => {
    const customer = 'Test existing customer';
    const company = 'fr';
    const project = 'Test old project';
    const projectType = ProjectType.BILLABLE
    const plannedHours = 100;
    const task = 'Test task old';

    //FIRST INSERT
    let response = await postTask(customer, company, project, task, projectType, plannedHours);
    t.equal(response.statusCode, 200)

    response = await getTask('Test existing customer', 'Test old project', 'fr');
    t.equal(response.statusCode, 200)
    let tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    let expectedResult = [{
        name: 'Test task old',
        completed: false,
        plannedHours: 0,
    }]
    t.same(tasks, expectedResult)

    //SECOND INSERT
    response = await postTask(customer,
        company,
        'Test new project',
        'Test task new',
        ProjectType.BILLABLE
        );
    t.equal(response.statusCode, 200)

    // CHECK NEW
    response = await getTask(customer, 'Test new project', company)
    t.equal(response.statusCode, 200)
    tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    expectedResult = [{
        name: 'Test task new',
        completed: false,
        plannedHours: 0,
    }]
    t.same(tasks, expectedResult)

    // CHECK OLD STILL EXISTS
    response = await getTask(customer, project, 'fr')
    t.equal(response.statusCode, 200)
    tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    expectedResult = [{
        name: 'Test task old',
        completed: false,
        plannedHours: 0,
    }]
    t.same(tasks, expectedResult)
})

test('create task with existing project and new customer - new insert', async (t) => {
    const customer = 'Test old customer';
    const company = 'cr';
    const project = 'Test existing project';
    const projectType = ProjectType.NON_BILLABLE
    const task = 'Test task old';

    //FIRST INSERT
    let response = await postTask(customer, company, project, task, projectType);
    t.equal(response.statusCode, 200)

    response = await getTask(customer, project, company)
    t.equal(response.statusCode, 200)
    let tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    let expectedResult = [{
        name: 'Test task old',
        completed: false,
        plannedHours: 0,
    }]
    t.same(tasks, expectedResult)

    //SECOND INSERT
    response = await postTask(customer, company, project, task, projectType);
    response = await postTask('Test new customer',
        company,
        project,
        'Test task new',
        ProjectType.NON_BILLABLE
        );
    t.equal(response.statusCode, 200)

    // CHECK NEW
    response = await getTask('Test new customer', project, company)
    t.equal(response.statusCode, 200)
    tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    expectedResult = [{
        name: 'Test task new',
        completed: false,
        plannedHours: 0,
    }]
    t.same(tasks, expectedResult)

    // CHECK OLD STILL EXISTS
    response = await getTask(customer, project, company)
    t.equal(response.statusCode, 200)
    tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    expectedResult = [{
        name: 'Test task old',
        completed: false,
        plannedHours: 0,
    }]
    t.same(tasks, expectedResult)
})

test('create task with same customer and project - update', async (t) => {
    const customer = 'Test customer2';
    const company = 'de';
    const project = 'Test project2';
    const projectType = ProjectType.SLACK_TIME
    const task = 'Test task2';

    // FIRST INSERT
    let response = await postTask(customer, company, project, task, projectType);
    t.equal(response.statusCode, 200)

    response = await getTask(customer, project, company)
    t.equal(response.statusCode, 200)

    let tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    let expectedResult = [{
        name: 'Test task2',
        completed: false,
        plannedHours: 0,
    }]
    t.same(tasks, expectedResult)

    // SECOND INSERT
    response = await postTask(customer, company, project,'Test task3', projectType);
    t.equal(response.statusCode, 200)
    t.same(JSON.parse(response.payload)['message'],
        'OK',
    );

    // CHECK TASK
    response = await getTask(customer, project, company)
    t.equal(response.statusCode, 200)
    tasks = response.json<TaskListType>()
    t.equal(tasks.length, 2)
    expectedResult = [{
        name: 'Test task2',
        completed: false,
        plannedHours: 0,
    }, {
        name: 'Test task3',
        completed: false,
        plannedHours: 0,
    }]
    t.same(tasks, expectedResult)

    // CHECK PROJECT TYPE TODO
    // const checkTasks = await taskRepository.getTasksWithProjectType({customer, project, company})
    // expectedResult = {  } //tasks: ['Test task2', 'Test task3'], projectType: ProjectType.SLACK_TIME
    // t.same(checkTasks, {})
})

test('create task with existing customer and project but different company - new insert', async (t) => {
    const customer = 'Test company';
    const company = 'uk';
    const project = 'company';
    const projectType = ProjectType.SLACK_TIME
    const task = 'Test';

    // INSERT UK ROW
    let response = await postTask(customer, company, project, task, projectType);
    t.equal(response.statusCode, 200)

    // INSERT US ROW
    response = await postTask(customer, 'us', project, task, ProjectType.SLACK_TIME);
    t.equal(response.statusCode, 200)

    //CHECK US TASKS
    response = await getTask(customer, project, 'us')
    t.equal(response.statusCode, 200)
    let tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    t.same(tasks, [{
        name: 'Test',
        completed: false,
        plannedHours: 0,
    }])

    //CHECK UK TASKS
    response = await getTask(customer, project, 'uk')
    t.equal(response.statusCode, 200)
    tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    t.same(tasks, [{
        name: 'Test',
        completed: false,
        plannedHours: 0,
    }])
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

async function getTask(customer: string, project: string, company: string) {
    return await app.inject({
        method: 'GET',
        url: `/api/task/task/?company=${company}&customer=${customer}&project=${project}`,
        headers: {
            authorization: `Bearer ${getToken(company)}`,
        },
    })
}