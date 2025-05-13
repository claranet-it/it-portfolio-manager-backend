import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { seedCompany } from '@test/seed/prisma/company'
import { PrismaClient } from '../../../../prisma/generated'
import { seedCompanyKeys } from '@test/seed/prisma/companyKeys'

let app: FastifyInstance
const prisma = new PrismaClient()

function getToken(): string {
  return app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it',
  })
}

beforeEach(async () => {
  app = createApp({ logger: false })
  await app.ready()
  await seedCompany()
  await seedCompanyKeys()
})

afterEach(async () => {
  const deleteKeys = prisma.companyKeys.deleteMany()
  const deleteCompany = prisma.company.deleteMany()

  await prisma.$transaction([deleteKeys, deleteCompany])
  await prisma.$disconnect()
  await app.close()
})

test('Read mine company keys', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/company/keys`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })

  t.equal(response.statusCode, 200)
})
