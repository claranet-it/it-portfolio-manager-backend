import { test, before, after } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { seedCompany } from '@test/seed/prisma/company'
import { PrismaClient } from '../../../prisma/generated'
import { seedCompanyConnections } from '@test/seed/prisma/companyConnections'

let app: FastifyInstance
const prisma = new PrismaClient()

function getToken(): string {
  return app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it',
    role: 'ADMIN',
  })
}

before(async () => {
  app = createApp({ logger: false })
  await app.ready()
  await seedCompany()
  await seedCompanyConnections()
})

after(async () => {
  const deleteCompanyConnections = prisma.companyConnections.deleteMany()
  const deleteCompany = prisma.company.deleteMany()

  await prisma.$transaction([deleteCompanyConnections, deleteCompany])
  await prisma.$disconnect()
  await app.close()
})

test('GET connected companies without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/companyConnections/mine`,
  })
  t.equal(response.statusCode, 401)
})

test('GET connected companies without ADMIN role', async (t) => {
  const tempToken = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it',
  })

  const response = await app.inject({
    method: 'GET',
    url: `/api/companyConnections/mine`,
    headers: {
      authorization: `Bearer ${tempToken}`,
    },
  })
  t.equal(response.statusCode, 403)
})

test('GET connected companies', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/companyConnections/mine`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(response.statusCode, 200)
  t.equal(response.json().length, 1)
})
