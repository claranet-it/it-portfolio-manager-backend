import { test, before, after } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { seedCompany } from '@test/seed/prisma/company'
import { PrismaClient } from '../../../prisma/generated'
import { seedCompanyConnections } from '@test/seed/prisma/companyConnections'

let app: FastifyInstance
const prisma = new PrismaClient()
let it
let us
let cna

function getToken(): string {
  return app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it',
    role: 'SUPERADMIN',
  })
}

before(async () => {
  app = createApp({ logger: false })
  await app.ready()
  await seedCompany()
  await seedCompanyConnections()

  it = await prisma.company.findFirst({ where: { name: 'it' } })
  us = await prisma.company.findFirst({ where: { name: 'us' } })
  cna = await prisma.company.findFirst({ where: { name: 'cna test' } })
})

after(async () => {
  const deleteCompanyConnections = prisma.companyConnections.deleteMany()
  const deleteCompany = prisma.company.deleteMany()

  await prisma.$transaction([deleteCompanyConnections, deleteCompany])
  await prisma.$disconnect()
  await app.close()
})

test('POST create connection without authentication', async (t) => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/companyConnections`,
    body: {
      requesterId: it!.id,
      correspondentId: us!.id,
    },
  })
  t.equal(response.statusCode, 401)
})

test('POST create connection without SUPERADMIN role', async (t) => {
  const tempToken = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it',
  })

  const response = await app.inject({
    method: 'POST',
    url: `/api/companyConnections`,
    headers: {
      authorization: `Bearer ${tempToken}`,
    },
    body: {
      requesterId: it!.id,
      correspondentId: us!.id,
    },
  })
  t.equal(response.statusCode, 403)
})

test('POST create connection existing on DB', async (t) => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/companyConnections`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    body: {
      requesterId: it!.id,
      correspondentId: us!.id,
    },
  })
  t.equal(response.statusCode, 400)
})

test('POST create connection', async (t) => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/companyConnections`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    body: {
      requesterId: it!.id,
      correspondentId: cna!.id,
    },
  })
  t.equal(response.statusCode, 204)
})
