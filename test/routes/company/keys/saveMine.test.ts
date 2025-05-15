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

test('Duplicate company keys ', async (t) => {
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

  t.equal(response.statusCode, 400)
  t.equal(response.body, 'Keys already exist')
})

test('Create keys for not existing company', async (t) => {
  await prisma.company.deleteMany({ where: { name: 'it' } })
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

  t.equal(response.statusCode, 404)
  t.equal(response.body, 'Company not found')
})


// TODO: uncomment this test only after type checking fix
// test('Validation fails on wrong type', async (t) => {
//   const response = await app.inject({
//     method: 'POST',
//     url: `/api/company/keys`,
//     headers: { authorization: `Bearer ${getToken()}` },
//     body: {
//       encryptedPrivateKey: true,
//       encryptedAESKey: 'test secret',
//       publicKey: 'test public key',
//     },
//   });
//   t.equal(response.statusCode, 400);
// });
