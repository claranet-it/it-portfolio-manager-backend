import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { CompanyWithSkillsType } from '@src/core/Company/model/Company'
import { seedCompany } from '@test/seed/prisma/company'
import { PrismaClient } from '../../../prisma/generated'
import { validate } from 'uuid'

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
  const deleteSkill = prisma.skill.deleteMany()
  const deleteCompany = prisma.company.deleteMany()

  await prisma.$transaction([
    deleteSkill,
    deleteCompany,
  ])
  await prisma.$disconnect()
  await app.close()
})

test('Read mine company without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/company/mine',
  })
  t.equal(response.statusCode, 401)
})

test('Read mine company', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/company/mine',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(response.statusCode, 200)
  const result = response.json<CompanyWithSkillsType>()
  t.ok(validate(result.id), 'id should be a valid UUID')
  t.equal(result.domain, 'claranet italia')
  t.equal(result.name, 'it')
  t.equal(result.image_url, 'sample_image_url')
  t.ok(result.skills, 'skills should be defined')
  t.equal(result.skills?.length, 28, 'skills should have 28 items')
})
