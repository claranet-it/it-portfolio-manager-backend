import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { seedCompany } from '@test/seed/prisma/company'
import { PrismaClient } from '../../../prisma/generated'
import { seedCustomers } from '@test/seed/prisma/customers'
import { seedProjects } from '@test/seed/prisma/projects'
import { seedTasks } from '@test/seed/prisma/tasks'

let app: FastifyInstance
const prisma = new PrismaClient()

function getToken(company: string = 'it'): string {
  return app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: company,
  })
}

beforeEach(async () => {
  app = createApp({ logger: false })
  await app.ready();
  await seedCompany();

  await seedCustomers();
  const customers: string[] = (await prisma.customer.findMany({
    where: {
      company_id: 'it'
    },
    select: {
      id: true
    }
  })).map((customer) => customer.id)

  await seedProjects(customers);
  const projects: string[] = (await prisma.project.findMany({
    where: {
      customer_id: {
        in: customers
      }
    },
    select: {
      id: true
    }
  })).map((project) => project.id)

  await seedTasks(projects);
});

afterEach(async () => {
  const deleteTasks = prisma.projectTask.deleteMany()
  const deleteProjects = prisma.project.deleteMany()
  const deleteCustomers = prisma.customer.deleteMany()
  const deleteCompany = prisma.company.deleteMany()

  await prisma.$transaction([deleteTasks, deleteProjects, deleteCustomers, deleteCompany])
  await prisma.$disconnect()
  await app.close()
})

test('Read data to encrypt without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/encryption/to-be-encrypted',
  })
  t.equal(response.statusCode, 401)
})

test('Read data to encrypt', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/encryption/to-be-encrypted`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })

  t.equal(response.statusCode, 200)
})

test('Read data to encrypt of not existing company keys', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/encryption/to-be-encrypted`,
    headers: {
      authorization: `Bearer ${getToken('wrong company name')}`,
    },
  })

  t.equal(response.statusCode, 404)
})
