import { afterEach, beforeEach, test } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { PrismaClient } from '../../../prisma/generated'

let app: FastifyInstance
const prisma = new PrismaClient()

// function getToken(company: string): string {
//     return app.createTestJwt({
//         email: 'nicholas.crow@email.com',
//         name: 'Nicholas Crow',
//         picture: 'https://test.com/nicholas.crow.jpg',
//         company: company,
//         role: "ADMIN",
//     })
// }

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
/*
test('create new task - new insert', async (t) => {
    const customer = {name: 'Test customer'};
    const company = 'es';
    const project = 'Test project';
    const projectType = ProjectType.BILLABLE;
    const plannedHours = 200;
    const task = 'Test task';

    let response = await postTask(customer, company, project, task, projectType, plannedHours);
    t.equal(response.statusCode, 200)

    const customerResponse = await getCustomers(company);
    t.equal(customerResponse.statusCode, 200)

    const customers = customerResponse.json<CustomerType[]>()
    t.equal(customers.length, 1)

    response = await getProjects(company, customers[0].id);
    t.equal(response.statusCode, 200)

    const projects = response.json<ProjectListType>()
    t.equal(projects.length, 1)

    response = await getTask(customers[0].id, projects[0].id ?? '', company);
    t.equal(response.statusCode, 200)

    const tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    const expectedResult = [{
        id: tasks[0].id,
        name: 'Test task',
        completed: false,
        plannedHours: 0,
    }]
    t.same(tasks, expectedResult)
})

test('create task with existing customer and new project - new insert', async (t) => {
    let customer: CustomerOptType = {
        name: 'Test existing customer'
    };
    const company = 'fr';
    const project = 'Test old project';
    const projectType = ProjectType.BILLABLE
    const plannedHours = 100;
    const task = 'Test task old';

    //FIRST INSERT
    let response = await postTask(customer, company, project, task, projectType, plannedHours);
    t.equal(response.statusCode, 200)

    const customerResponse = await getCustomers(company);
    t.equal(customerResponse.statusCode, 200)

    const customers = customerResponse.json<CustomerType[]>()
    t.equal(customers.length, 1)

    response = await getProjects(company, customers[0].id);
    t.equal(response.statusCode, 200)

    let projects = response.json<ProjectListType>()
    t.equal(projects.length, 1)

    response = await getTask(customers[0].id, projects[0].id ?? '', company);
    t.equal(response.statusCode, 200)
    let tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    let expectedResult = [{
        id: tasks[0].id,
        name: 'Test task old',
        completed: false,
        plannedHours: 0,
    }]
    t.same(tasks, expectedResult)

    //SECOND INSERT
    customer = {
        id: customers[0].id,
        name: customers[0].name
    }
    response = await postTask(
        customer,
        company,
        'Test new project',
        'Test task new',
        ProjectType.BILLABLE
        );
    t.equal(response.statusCode, 200)

    response = await getProjects(company, customers[0].id);
    t.equal(response.statusCode, 200)

    projects = response.json<ProjectListType>()
    t.equal(projects.length, 2)

    let secondProject = projects.find(p => p.name === 'Test new project')
    let firstProject = projects.find(p => p.name === 'Test old project')

    // CHECK NEW
    response = await getTask(customers[0].id, secondProject?.id ?? '', company)
    t.equal(response.statusCode, 200)
    tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    expectedResult = [{
        id: tasks[0].id,
        name: 'Test task new',
        completed: false,
        plannedHours: 0,
    }]
    t.same(tasks, expectedResult)

    // CHECK OLD STILL EXISTS
    response = await getTask(customers[0].id, firstProject?.id ?? '', 'fr')
    t.equal(response.statusCode, 200)
    tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    expectedResult = [{
        id: tasks[0].id,
        name: 'Test task old',
        completed: false,
        plannedHours: 0,
    }]
    t.same(tasks, expectedResult)
})

test('create task with existing project and new customer - new insert', async (t) => {
    let oldCustomer: CustomerOptType = {
        name: 'Test old customer'
    };
    const company = 'cr';
    const project = 'Test existing project';
    const projectType = ProjectType.NON_BILLABLE
    const task = 'Test task old';

    //FIRST INSERT
    let response = await postTask(oldCustomer, company, project, task, projectType);
    t.equal(response.statusCode, 200)

    let customerResponse = await getCustomers(company);
    t.equal(customerResponse.statusCode, 200)

    let customers = customerResponse.json<CustomerType[]>()
    t.equal(customers.length, 1)

    response = await getProjects(company, customers[0].id);
    t.equal(response.statusCode, 200)

    let projects = response.json<ProjectListType>()
    t.equal(projects.length, 1)

    response = await getTask(customers[0].id, projects[0].id ?? '', company);
    t.equal(response.statusCode, 200)
    let tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    let expectedResult = [{
        id: tasks[0].id,
        name: 'Test task old',
        completed: false,
        plannedHours: 0,
    }]
    t.same(tasks, expectedResult)

    //SECOND INSERT
    oldCustomer = {
        id: customers[0].id,
        name: customers[0].name
    }
    response = await postTask(
      oldCustomer,
      company,
      projects[0].name,
      task,
      projectType,
      undefined,
      projects[0].id
);
    t.equal(response.statusCode, 200)
    response = await postTask({ name: 'Test new customer'},
        company,
        project,
        'Test task new',
        ProjectType.NON_BILLABLE
        );
    t.equal(response.statusCode, 200)

    customerResponse = await getCustomers(company);
    t.equal(customerResponse.statusCode, 200)

    customers = customerResponse.json<CustomerType[]>()
    t.equal(customers.length, 2)

    const newCustomer = customers.find(c => c.name === 'Test new customer')

    // CHECK NEW
    let allTasks = await prisma.projectTask.findMany()
    console.log(allTasks)
    response = await getTask(newCustomer?.id ?? '', projects[0].id ?? '', company)
    t.equal(response.statusCode, 200)
    tasks = response.json<TaskListType>()
    console.log(tasks)
    t.equal(tasks.length, 1)
    expectedResult = [{
        id: tasks[0].id,
        name: 'Test task new',
        completed: false,
        plannedHours: 0,
    }]
    t.same(tasks, expectedResult)

    // CHECK OLD STILL EXISTS
    response = await getTask(oldCustomer.id ?? '', projects[0].id ?? '', company)
    t.equal(response.statusCode, 200)
    tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    expectedResult = [{
        id: tasks[0].id,
        name: 'Test task old',
        completed: false,
        plannedHours: 0,
    }]
    t.same(tasks, expectedResult)
})

test('create task with same customer and project - update', async (t) => {
    const customer: CustomerOptType = { name: 'Test customer2' };
    const company = 'de';
    const project = 'Test project2';
    const projectType = ProjectType.SLACK_TIME
    const task = 'Test task2';

    // FIRST INSERT
    let response = await postTask(customer, company, project, task, projectType);
    t.equal(response.statusCode, 200)

    const customerResponse = await getCustomers(company);
    t.equal(customerResponse.statusCode, 200)

    const customers = customerResponse.json<CustomerType[]>()
    t.equal(customers.length, 1)

    response = await getProjects(company, customers[0].id);
    t.equal(response.statusCode, 200)

    let projects = response.json<ProjectListType>()
    t.equal(projects.length, 1)

    response = await getTask(customers[0].id, projects[0].id ?? '', company);
    t.equal(response.statusCode, 200)

    let tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    let expectedResult = [{
        id: tasks[0].id,
        name: 'Test task2',
        completed: false,
        plannedHours: 0,
    }]
    t.same(tasks, expectedResult)

    // SECOND INSERT
    response = await postTask(customers[0], company, project,'Test task3', projectType);
    t.equal(response.statusCode, 200)
    t.same(JSON.parse(response.payload)['message'],
        'OK',
    );

    // CHECK TASK
    response = await getTask(customers[0].id, projects[0].id ?? '', company)
    t.equal(response.statusCode, 200)
    tasks = response.json<TaskListType>()
    t.equal(tasks.length, 2)
    expectedResult = [{
        id: tasks.find(t => t.name === 'Test task2')?.id ?? '',
        name: 'Test task2',
        completed: false,
        plannedHours: 0,
    }, {
        id: tasks.find(t => t.name === 'Test task3')?.id ?? '',
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
    const customer = { name: 'Test company'};
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

    const customerResponse = await getCustomers(company);
    t.equal(customerResponse.statusCode, 200)

    const customers = customerResponse.json<CustomerType[]>()
    t.equal(customers.length, 1)

    response = await getProjects(company, customers[0].id);
    t.equal(response.statusCode, 200)

    let projects = response.json<ProjectListType>()
    t.equal(projects.length, 1)

    //CHECK US TASKS
    response = await getTask(customers[0].id, projects[0].id ?? '', 'us')
    t.equal(response.statusCode, 200)
    let tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    t.same(tasks, [{
        id: tasks[0].id,
        name: 'Test',
        completed: false,
        plannedHours: 0,
    }])

    //CHECK UK TASKS
    response = await getTask(customers[0].id, projects[0].id ?? '', 'uk')
    t.equal(response.statusCode, 200)
    tasks = response.json<TaskListType>()
    t.equal(tasks.length, 1)
    t.same(tasks, [{
        id: tasks[0].id,
        name: 'Test',
        completed: false,
        plannedHours: 0,
    }])
})


async function postTask(customer: CustomerOptType, company: string, project: string, task: string, projectType?: string, plannedHours?: number, projectId?: string) {
    return await app.inject({
        method: 'POST',
        url: '/api/task/task/',
        headers: {
            authorization: `Bearer ${getToken(company)}`,
        },
        payload: {
            customer: customer,
            project: { id: projectId, name:project, type: projectType, plannedHours: plannedHours},
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

async function getCustomers(company: string) {
    return await app.inject({
        method: 'GET',
        url: `/api/task/customer`,
        headers: {
            authorization: `Bearer ${getToken(company)}`,
        },
    })
}

async function getProjects(company: string, customer: string) {
    return await app.inject({
        method: 'GET',
        url: `/api/task/project?customer=${customer}`,
        headers: {
            authorization: `Bearer ${getToken(company)}`,
        },
    })
}

 */