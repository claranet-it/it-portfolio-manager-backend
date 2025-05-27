import { afterEach, beforeEach, test } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import {
  CustomerOptType,
  CustomerType,
  ProjectDetailsType, ProjectListType,
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
    role: 'ADMIN',
  })
}

beforeEach(async () => {
  app = createApp({ logger: false })
  await app.ready()
})

afterEach(async () => {
  const prisma = new PrismaClient()
  const deleteCustomer = prisma.customer.deleteMany()
  const deleteProject = prisma.project.deleteMany()
  const deleteTask = prisma.projectTask.deleteMany()

  await prisma.$transaction([deleteTask, deleteProject, deleteCustomer])
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
  const customerName = {name: 'Test update customer'}
  const company = 'test update company'
  const projectName = 'Test update project'
  const projectType = ProjectType.BILLABLE
  const task = 'Test update task'

  let response = await postTask(customerName, company, projectName, projectType, task)
  t.equal(response.statusCode, 200)

  response = await getCustomers(company)
  t.equal(response.statusCode, 200)

  let customers = response.json<CustomerType[]>()

  t.equal(customers.length, 1)
  let expectedResult = ['Test update customer']
  t.same(customers.map((customer) => customer.name), expectedResult)

  response = await getProjects(company, customers[0].id)
  t.equal(response.statusCode, 200)

  let projects= response.json<ProjectListType>()
  t.equal(projects.length, 1)
  expectedResult = ['Test update project']
  t.same(projects.map((project) => project.name), expectedResult)

  response = await putCustomer(
    customers[0].id,
    company,
    { id: projects[0].id, name: projects[0].name, type: projects[0].type, plannedHours: 0, completed: true },
    'Test update new customer',
  )
  t.equal(response.statusCode, 200)

  response = await getCustomers(company)
  t.equal(response.statusCode, 200)
  customers = response.json<CustomerType[]>()
  t.equal(customers.length, 1)
  expectedResult = ['Test update new customer']
  t.same(customers.map((customer) => customer.name), expectedResult)
})

test('update project - all', async (t) => {
  const customerName = {name: 'Test update project all customer'}
  const company = 'Test update project all company'
  const projectName = 'Test update project all project'
  const projectType = ProjectType.SLACK_TIME
  const plannedHours = 200
  const task = 'Test update project all task'

  let response = await postTask(
    customerName,
    company,
    projectName,
    projectType,
    task,
    plannedHours,
  )
  t.equal(response.statusCode, 200)


  response = await getCustomers(company)
  t.equal(response.statusCode, 200)

  let customers = response.json<CustomerType[]>()

  t.equal(customers.length, 1)
  let expectedCustomer = ['Test update project all customer']
  t.same(customers.map((customer) => customer.name), expectedCustomer)

  response = await getProjects(company, customers[0].id)
  t.equal(response.statusCode, 200)

  let projects = response.json<ProjectListType>()
  t.equal(projects.length, 1)
  let expectedResult: ProjectListType = [
    {
      id: projects[0].id,
      name: projectName,
      type: ProjectType.SLACK_TIME,
      plannedHours: plannedHours,
      completed: false,
    },
  ]
  t.same(projects, expectedResult)

  const newProjectName = 'Test update NEW project all project'
  const newProjectType = ProjectType.BILLABLE
  const newPlannedHours = 300
  response = await putProject(
    customers[0].id,
    company,
    {
      id: projects[0].id,
      name: projects[0].name,
      type: projects[0].type,
      plannedHours: projects[0].plannedHours,
      completed: false,
    },
    {
      name: newProjectName,
      type: newProjectType,
      plannedHours: newPlannedHours,
      completed: true,
    },
  )
  t.equal(response.statusCode, 200)

  response = await getProjects(company, customers[0].id)
  t.equal(response.statusCode, 200)
  projects = response.json<ProjectListType>()
  t.equal(projects.length, 1)
  expectedResult = [
    {
      id: projects[0].id,
      name: newProjectName,
      type: newProjectType,
      plannedHours: newPlannedHours,
      completed: true,
    },
  ]
  t.same(projects, expectedResult)
})

test('update project - only name', async (t) => {
  const customerName = {name: 'Test update project customer'}
  const company = 'Test update project company'
  const projectName = 'Test update project project'
  const projectType = ProjectType.NON_BILLABLE
  const task = 'Test update project task'

  let response = await postTask(customerName, company, projectName, projectType, task)
  t.equal(response.statusCode, 200)

  response = await getCustomers(company)
  t.equal(response.statusCode, 200)

  let customers = response.json<CustomerType[]>()

  t.equal(customers.length, 1)
  let expectedCustomer = [customerName.name]
  t.same(customers.map((customer) => customer.name), expectedCustomer)

  response = await getProjects(company, customers[0].id)
  t.equal(response.statusCode, 200)

  let projects = response.json<ProjectListType>()

  t.equal(projects.length, 1)
  let expectedResult = [
    {
      id: projects[0].id,
      name: projectName,
      type: ProjectType.NON_BILLABLE,
      plannedHours: 0,
      completed: false,
    },
  ]
  t.same(projects, expectedResult)

  const newProjectName = 'Test update NEW project project'
  response = await putProject(
    customers[0].id,
    company,
    { id: projects[0].id, name: projects[0].name, type: projects[0].type, plannedHours: projects[0].plannedHours, completed: false },
    {
      name: newProjectName,
      type: projectType,
      plannedHours: 0,
      completed: true,
    },
  )
  t.equal(response.statusCode, 200)

  response = await getProjects(company, customers[0].id)
  t.equal(response.statusCode, 200)
  projects = response.json<ProjectListType>()
  t.equal(projects.length, 1)
  expectedResult = [
    {
      id: projects[0].id,
      name: newProjectName,
      type: ProjectType.NON_BILLABLE,
      plannedHours: 0,
      completed: true,
    },
  ]
  t.same(projects, expectedResult)
})

test('update project - only projectType', async (t) => {
  const customerName = {name: 'Test update project2 customer'}
  const company = 'Test update project2 company'
  const projectName = 'Test update project2 project'
  const projectType = ProjectType.ABSENCE
  const task = 'Test update project2 task'

  let response = await postTask(customerName, company, projectName, projectType, task)
  t.equal(response.statusCode, 200)

  response = await getCustomers(company)
  t.equal(response.statusCode, 200)

  let customers = response.json<CustomerType[]>()

  t.equal(customers.length, 1)
  let expectedCustomer = [customerName.name]
  t.same(customers.map((customer) => customer.name), expectedCustomer)

  response = await getProjects(company, customers[0].id)
  t.equal(response.statusCode, 200)

  let projects = response.json<ProjectListType>()

  t.equal(projects.length, 1)
  let expectedResult: ProjectListType = [
    {
      id: projects[0].id,
      name: projectName,
      type: ProjectType.ABSENCE,
      plannedHours: 0,
      completed: false,
    },
  ]
  t.same(projects, expectedResult)

  response = await putProject(
    customers[0].id,
    company,
    { id: projects[0].id, name: projects[0].name, type: projects[0].type, plannedHours: projects[0].plannedHours, completed: false },
    {
      name: projectName,
      type: ProjectType.NON_BILLABLE,
      plannedHours: 0,
      completed: true,
    },
  )
  t.equal(response.statusCode, 200)

  response = await getProjects(company, customers[0].id)
  t.equal(response.statusCode, 200)
  projects = response.json<ProjectListType>()
  t.equal(projects.length, 1)
  expectedResult = [
    {
      id: projects[0].id,
      name: projectName,
      type: ProjectType.NON_BILLABLE,
      plannedHours: 0,
      completed: true,
    },
  ]
  t.same(projects, expectedResult)
})

test('update project - only plannedHours', async (t) => {
  const customerName = {name: 'Test update project3 customer'}
  const company = 'Test update project3 company'
  const projectName = 'Test update project3 project'
  const projectType = ProjectType.ABSENCE
  const task = 'Test update project3 task'

  let response = await postTask(customerName, company, projectName, projectType, task)
  t.equal(response.statusCode, 200)

  response = await getCustomers(company)
  t.equal(response.statusCode, 200)

  let customers = response.json<CustomerType[]>()

  t.equal(customers.length, 1)
  let expectedCustomer = [customerName.name]
  t.same(customers.map((customer) => customer.name), expectedCustomer)

  response = await getProjects(company, customers[0].id)
  t.equal(response.statusCode, 200)

  let projects = response.json<ProjectListType>()

  t.equal(projects.length, 1)
  let expectedResult = [
    {
      id: projects[0].id,
      name: projectName,
      type: ProjectType.ABSENCE,
      plannedHours: 0,
      completed: false,
    },
  ]
  t.same(projects, expectedResult)

  const newPlannedHours = 300
  response = await putProject(
    customers[0].id,
    company,
    { id: projects[0].id, name: projects[0].name, type: projects[0].type, plannedHours: projects[0].plannedHours, completed: false },
    {
      name: projectName,
      type: ProjectType.ABSENCE,
      plannedHours: newPlannedHours,
      completed: true,
    },
  )
  t.equal(response.statusCode, 200)

  response = await getProjects(company, customers[0].id)
  t.equal(response.statusCode, 200)
  projects = response.json<ProjectListType>()
  t.equal(projects.length, 1)
  expectedResult = [
    {
      id: projects[0].id,
      name: projectName,
      type: ProjectType.ABSENCE,
      plannedHours: newPlannedHours,
      completed: true,
    },
  ]
  t.same(projects, expectedResult)
})

test('update project - plannedHours = 0', async (t) => {
  const customerName = {name: 'Test update project3 customer'}
  const company = 'Test update project3 company'
  const projectName = 'Test update project3 project'
  const projectType = ProjectType.ABSENCE
  const task = 'Test update project3 task'

  let response = await postTask(
    customerName,
    company,
    projectName,
    projectType,
    task,
    300,
  )
  t.equal(response.statusCode, 200)

  response = await getCustomers(company)
  t.equal(response.statusCode, 200)

  let customers = response.json<CustomerType[]>()

  t.equal(customers.length, 1)
  let expectedCustomer = [customerName.name]
  t.same(customers.map((customer) => customer.name), expectedCustomer)

  response = await getProjects(company, customers[0].id)
  t.equal(response.statusCode, 200)

  let projects = response.json<ProjectListType>()

  t.equal(projects.length, 1)
  let expectedResult = [
    {
      id: projects[0].id,
      name: projectName,
      type: ProjectType.ABSENCE,
      plannedHours: 300,
      completed: false,
    },
  ]
  t.same(projects, expectedResult)

  const newPlannedHours = 0
  response = await putProject(
    customers[0].id,
    company,
    { id: projects[0].id, name: projects[0].name, type: projects[0].type, plannedHours: 300, completed: false },
    {
      name: projectName,
      type: ProjectType.ABSENCE,
      plannedHours: newPlannedHours,
      completed: true,
    },
  )
  t.equal(response.statusCode, 200)

  response = await getProjects(company, customers[0].id)
  t.equal(response.statusCode, 200)
  projects = response.json<ProjectListType>()
  t.equal(projects.length, 1)
  expectedResult = [
    {
      id: projects[0].id,
      name: projectName,
      type: ProjectType.ABSENCE,
      plannedHours: newPlannedHours,
      completed: true,
    },
  ]
  t.same(projects, expectedResult)
})

async function postTask(
  customer: CustomerOptType,
  company: string,
  project: string,
  projectType: string,
  task: string,
  plannedHours?: number,
) {
  return await app.inject({
    method: 'POST',
    url: '/api/task/task/',
    headers: {
      authorization: `Bearer ${getToken(company)}`,
    },
    payload: {
      customer: customer,
      project: { name: project, type: projectType, plannedHours: plannedHours },
      task: task,
    },
  })
}

async function putCustomer(
  customer: string,
  company: string,
  project: ProjectDetailsType,
  newCustomer: string,
) {
  return await app.inject({
    method: 'PUT',
    url: '/api/task/customer-project/',
    headers: {
      authorization: `Bearer ${getToken(company)}`,
    },
    payload: {
      customer: customer,
      project: project,
      newCustomer: newCustomer,
    },
  })
}

async function putProject(
  customer: string,
  company: string,
  project: ProjectDetailsType,
  newProject: ProjectDetailsType,
) {
  return await app.inject({
    method: 'PUT',
    url: '/api/task/customer-project/',
    headers: {
      authorization: `Bearer ${getToken(company)}`,
    },
    payload: {
      customer: customer,
      project: project,
      newProject: newProject,
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
