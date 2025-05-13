import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { seedCompany } from '@test/seed/prisma/company'
import { PrismaClient } from '../../../../prisma/generated'
import { seedCompanyKeys } from '@test/seed/prisma/companyKeys'
import { Type } from '@sinclair/typebox'

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
})

afterEach(async () => {
  const deleteKeys = prisma.companyKeys.deleteMany()
  const deleteCompany = prisma.company.deleteMany()

  await prisma.$transaction([deleteKeys, deleteCompany])
  await prisma.$disconnect()
  await app.close()
})

test('Create mine company keys', async (t) => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/company/keys`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    body: {
      encryptedPrivateKey: 'test key',
      encryptedAESKey: 'test secret',
      publicKey: 'test public key',
    },
  })

  t.equal(response.statusCode, 201)
})

test('Create mine company keys', async (t) => {
  await seedCompanyKeys();
  const response = await app.inject({
    method: 'POST',
    url: `/api/company/keys`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    body: {
      encryptedPrivateKey: 'test key',
      encryptedAESKey: 'test secret',
      publicKey: 'test public key',
    },
  })

  t.equal(response.statusCode, 403)
})
