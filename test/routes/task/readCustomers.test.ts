import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { CustomerListType } from '@src/core/Task/model/task.model'
import { PrismaClient } from '../../../prisma/generated'
import { ProjectType } from '@src/core/Report/model/productivity.model'

let app: FastifyInstance
const prisma = new PrismaClient()

const inputs = [
  {
    company: 'it',
    expectedCustomers: [
      {
        name: 'Claranet',
        company_id: 'it',
        projects: [{
          name: 'Assenze',
          project_type: ProjectType.ABSENCE,
          plannedHours: 0,
          completed: true,
        },
        {
          name: 'Funzionale',
          project_type: ProjectType.NON_BILLABLE,
          plannedHours: 0,
          completed: true,
        },
        {
          name: 'Slack time',
          project_type: ProjectType.SLACK_TIME,
          plannedHours: 0,
          completed: true
        },]
      },{
        name: 'test customer',
        company_id: 'it',
        projects: [
          {
            name: 'Assenze',
            project_type: ProjectType.ABSENCE,
            plannedHours: 0,
            completed: true,
          },
          {
            name: 'Funzionale',
            project_type: ProjectType.NON_BILLABLE,
            plannedHours: 0,
            completed: false,
          },
          {
            name: 'Slack time',
            project_type: ProjectType.SLACK_TIME,
            plannedHours: 0,
          },
        ]
      }
    ]
  },
  {
    company: "other_company",
    expectedCustomers: [
      {
        name: 'test customer of other company',
        company_id: 'other_company',
        projects: [
          {
            name: 'Assenze',
            project_type: ProjectType.ABSENCE,
            plannedHours: 0,
            completed: false,
          },
          {
            name: 'Funzionale',
            project_type: ProjectType.NON_BILLABLE,
            plannedHours: 0,
          },
          {
            name: 'Slack time',
            project_type: ProjectType.SLACK_TIME,
            plannedHours: 0,
          },
        ]
      }
    ]
  },
]

beforeEach(async () => {
  app = createApp({ logger: false });
  await app.ready();

  for (const input of inputs) {
    for (const customerData of input.expectedCustomers) {
      const customer = await prisma.customer.create({
        data: {
          name: customerData.name,
          company_id: customerData.company_id,
        },
      });

      await prisma.project.createMany({
        data: customerData.projects.map(project => ({
          ...project,
          customer_id: customer.id
        }))
      });
    }
  }
});


afterEach(async () => {
  const deleteCustomer = prisma.customer.deleteMany()
  const deleteProject = prisma.project.deleteMany()

  await prisma.$transaction([deleteProject, deleteCustomer])
  await prisma.$disconnect()
  await app.close()
})

test('read customers without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/task/customer',
  })

  t.equal(response.statusCode, 401)
})

inputs.forEach((input) => {
  test(`read customers with company ${input.company} param`, async (t) => {
    const token = app.createTestJwt({
      email: 'nicholas.crow@email.com',
      name: 'Nicholas Crow',
      picture: 'https://test.com/nicholas.crow.jpg',
      company: input.company,
    })

    const response = await app.inject({
      method: 'GET',
      url: '/api/task/customer',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    t.equal(response.statusCode, 200)

    const customers = response.json<CustomerListType>()
    t.equal(customers.length, input.expectedCustomers.length)

    t.same(customers, input.expectedCustomers.map((customer) => customer.name))
  })
})

inputs.forEach((input) => {
  test(`read customers with company ${input.company} param and not completed`, async (t) => {
    const token = app.createTestJwt({
      email: 'nicholas.crow@email.com',
      name: 'Nicholas Crow',
      picture: 'https://test.com/nicholas.crow.jpg',
      company: input.company,
    })

    const response = await app.inject({
      method: 'GET',
      url: '/api/task/customer?completed=false',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    t.equal(response.statusCode, 200)

    const customers = response.json<CustomerListType>()
  
    const incompleteCustomers = input.expectedCustomers
    .filter(customer => 
      customer.projects.some(project => project.completed !== true)
    )
    .map(customer => customer.name);

    t.equal(customers.length, incompleteCustomers.length)

    t.same(customers, incompleteCustomers)
  })
})
