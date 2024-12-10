import { test, before, after } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { seedCompany } from '@test/seed/prisma/company'
import { PrismaClient } from '../../../prisma/generated'

let app: FastifyInstance
const prisma = new PrismaClient()
let itCompanyId = ''
let testCompanyId = ''

function getToken(): string {
  return app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it',
    role: "ADMIN",
  })
}

before(async () => {
  app = createApp({ logger: false })
  await app.ready()
  await seedCompany()

  const companyIt = await prisma.company.findFirstOrThrow({
    where: {
      name: 'it'
    }
  })
  itCompanyId = companyIt.id

  const companyTest = await prisma.company.findFirstOrThrow({
    where: {
      name: 'test company'
    }
  })
  testCompanyId = companyTest.id
})

after(async () => {
  const deleteCompany = prisma.company.deleteMany()

  await prisma.$transaction([
    deleteCompany,
  ])
  await prisma.$disconnect()
  await app.close()
})

test('Patch company without authentication', async (t) => {
  const response = await app.inject({
    method: 'PATCH',
    url: `/api/company/${itCompanyId}`,
    body: {
      image_url: 'test update image of company'
    }
  })
  t.equal(response.statusCode, 401)
})

test('Patch company without ADMIN role', async (t) => {
  const tempToken = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it',
  })

  const response = await app.inject({
    method: 'PATCH',
    url: `/api/company/${itCompanyId}`,
    headers: {
      authorization: `Bearer ${tempToken}`,
    },
    body: {
      image_url: 'test update image of company'
    }
  })
  t.equal(response.statusCode, 403)
})

test('Patch company not mine', async (t) => {
  const response = await app.inject({
    method: 'PATCH',
    url: `/api/company/${testCompanyId}`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    body: {
      image_url: 'test update image of company'
    }
  })
  t.equal(response.statusCode, 403)
})

test('Patch company', async (t) => {
  const response = await app.inject({
    method: 'PATCH',
    url: `/api/company/${itCompanyId}`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    body: {
      image_url: 'test update image of company'
    }
  })
  t.equal(response.statusCode, 200)

  const updatedCompany = await prisma.company.findFirstOrThrow({
    where: {
      id: itCompanyId
    }
  })
  t.equal(updatedCompany.image_url, 'test update image of company')
})
