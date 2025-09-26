import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { CompanyType } from '@src/core/Company/model/Company'
import { seedCompany } from '@test/seed/prisma/company'
import { PrismaClient } from '../../../prisma/generated'

let app: FastifyInstance
const prisma = new PrismaClient()

function getToken(): string {
  return app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it',
    role: 'SUPERADMIN',
  })
}

beforeEach(async () => {
  app = createApp({ logger: false })
  await app.ready()
  await seedCompany()
})

afterEach(async () => {
  const deleteCompany = prisma.company.deleteMany()

  await prisma.$transaction([deleteCompany])
  await prisma.$disconnect()
  await app.close()
})

test('Read companies without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/company/',
  })
  t.equal(response.statusCode, 401)
})

test('Read companies without SUPERADMIN token', async (t) => {
  const token = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it'
  })

  const response = await app.inject({
    method: 'GET',
    url: '/api/company/',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
  t.equal(response.statusCode, 403)
})

test('Read companies', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/company/',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(response.statusCode, 200)
  const result = response.json<CompanyType[]>()
  t.equal(result.length, 4)
})
