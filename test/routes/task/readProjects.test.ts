import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { ProjectListType } from '@src/core/Task/model/task.model'
import { PrismaClient } from '../../../prisma/generated'
import { ProjectType } from '@src/core/Report/model/productivity.model'

let app: FastifyInstance
const prisma = new PrismaClient()

const inputs = [
  {
    company: 'it',
    customer: 'Claranet',
    customerId: '',
    expectProjects: [
      {
        name: 'Assenze',
        type: ProjectType.ABSENCE,
        plannedHours: 0,
        completed: true,
      },
      {
        name: 'Funzionale',
        type: ProjectType.NON_BILLABLE,
        plannedHours: 0,
        completed: false,
      },
      {
        name: 'Slack time',
        type: ProjectType.SLACK_TIME,
        plannedHours: 0,
        completed: false,
      },
    ],
  },
  {
    company: 'it',
    customer: 'test customer',
    customerId: '',
    expectProjects: [
      {
        name: 'SOR Sviluppo',
        type: ProjectType.BILLABLE,
        plannedHours: 0,
        completed: false,
      },
    ],
  },
  {
    company: 'other company',
    customer: 'test customer of other company',
    customerId: '',
    expectProjects: [
      {
        name: 'test project of other company',
        type: ProjectType.BILLABLE,
        plannedHours: 0,
        completed: false,
      },
    ],
  },
]

beforeEach(async () => {
  app = createApp({ logger: false })
  await app.ready()

  const customer = await prisma.customer.create({
    data: {
      name: 'Claranet',
      company_id: 'it',
    },
  })
  inputs[0].customerId = customer.id
  await prisma.project.createMany({
    data: [
      {
        name: 'Assenze',
        project_type: ProjectType.ABSENCE,
        plannedHours: 0,
        customer_id: customer.id,
        completed: true,
      },
      {
        name: 'Funzionale',
        project_type: ProjectType.NON_BILLABLE,
        plannedHours: 0,
        customer_id: customer.id,
      },
      {
        name: 'Slack time',
        project_type: ProjectType.SLACK_TIME,
        plannedHours: 0,
        customer_id: customer.id,
      },
    ],
  })
  const customer2 = await prisma.customer.create({
    data: {
      name: 'test customer',
      company_id: 'it',
    },
  })
  inputs[1].customerId = customer2.id
  await prisma.project.createMany({
    data: [
      {
        name: 'SOR Sviluppo',
        project_type: ProjectType.BILLABLE,
        plannedHours: 0,
        customer_id: customer2.id,
      },
    ],
  })
  const customer3 = await prisma.customer.create({
    data: {
      name: 'test customer of other company',
      company_id: 'other company',
    },
  })
  inputs[2].customerId = customer3.id
  await prisma.project.createMany({
    data: [
      {
        name: 'test project of other company',
        project_type: ProjectType.BILLABLE,
        plannedHours: 0,
        customer_id: customer3.id,
      },
    ],
  })
})

afterEach(async () => {
  const deleteCustomer = prisma.customer.deleteMany()
  const deleteProject = prisma.project.deleteMany()

  await prisma.$transaction([deleteProject, deleteCustomer])
  await prisma.$disconnect()
  await app.close()
})

test('read projects without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/task/project',
  })

  t.equal(response.statusCode, 401)
})

inputs.forEach((input) => {
  test(`read projects with company ${input.company} and customer ${input.customer} param`, async (t) => {
    const token = app.createTestJwt({
      email: 'nicholas.crow@email.com',
      name: 'Nicholas Crow',
      picture: 'https://test.com/nicholas.crow.jpg',
      company: input.company,
    })

    const response = await app.inject({
      method: 'GET',
      url: `/api/task/project/?customer=${input.customerId}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    t.equal(response.statusCode, 200)

    const projects = response.json<ProjectListType>()
    t.equal(projects.length, input.expectProjects.length)

    t.same(projects.map((project) => project.name), input.expectProjects.map((project) => project.name))
  })
})

test(`read not completed projects`, async (t) => {
  const token = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it',
  })

  const response = await app.inject({
    method: 'GET',
    url: `/api/task/project/?customer=${inputs[0].customerId}&completed=false`,
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)

  const projects = response.json<ProjectListType>()
  t.equal(projects.length, 2)
})


test(`read completed projects`, async (t) => {
  const token = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it',
  })

  const response = await app.inject({
    method: 'GET',
    url: `/api/task/project/?customer=${inputs[0].customerId}&completed=true`,
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)

  const projects = response.json<ProjectListType>()
  t.equal(projects.length, 1)
})
