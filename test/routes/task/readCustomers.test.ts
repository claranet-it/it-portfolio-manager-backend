import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { CustomerListType } from '@src/core/Task/model/task.model'
import { Prisma, PrismaClient } from '../../../prisma/generated'

let app: FastifyInstance
const prisma = new PrismaClient()

const inputs = [
  {
    company: 'it',
    expectedCustomers: ['Claranet', 'test customer'],
  },
  {
    company: "other company",
    expectedCustomers: ['test customer of other company'],
  },
]

beforeEach(async () => {
  app = createApp({ logger: false })
  await app.ready()

  const create: Prisma.PrismaPromise<Prisma.BatchPayload>[] = []
  inputs.forEach((input) => {
    input.expectedCustomers.forEach((customer) => {
      create.push(prisma.customer.createMany({
        data: {
          name: customer,
          company_id: input.company
        }
      }))
    })
  })
  await prisma.$transaction(create)
})

afterEach(async () => {
  const deleteCustomer = prisma.customer.deleteMany()

  await prisma.$transaction([
    deleteCustomer,
  ])
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

    t.same(customers, input.expectedCustomers)
  })
})
