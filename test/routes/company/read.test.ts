import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { CompanyWithConnectionStatusType } from '@src/core/Company/model/Company'
import { seedCompany } from '@test/seed/prisma/company'
import { PrismaClient } from '../../../prisma/generated'
import { seedCompanyConnections } from '@test/seed/prisma/companyConnections'
import { seedSkill } from '@test/seed/prisma/skill'

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
  await seedSkill()
  await seedCompanyConnections()
})

afterEach(async () => {
  const deleteCompanyConnections = prisma.companyConnections.deleteMany()
  const deleteSkills = prisma.skill.deleteMany()
  const deleteCompany = prisma.company.deleteMany()

  await prisma.$transaction([deleteCompanyConnections, deleteSkills, deleteCompany])
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
  const result = response.json<CompanyWithConnectionStatusType[]>()
  t.equal(result.length, 4)
})

test('Read companies excluding mine', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/company/?excludeMine=true',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
  })
  t.equal(response.statusCode, 200)
  const result = response.json<CompanyWithConnectionStatusType[]>()
  t.equal(result.length, 3)
  const companyNames = result.map(c => c.name)
  t.notOk(companyNames.includes('it'), 'Should not include the user\'s company "it"')
  
  const usCompany = result.find(c => c.name === 'us')
  const cnaTestCompany = result.find(c => c.name === 'cna test')
  const testCompany = result.find(c => c.name === 'test company')
  
  t.ok(usCompany, 'Should include "us" company')
  t.ok(cnaTestCompany, 'Should include "cna test" company')
  t.ok(testCompany, 'Should include "test company"')
  
  t.equal(usCompany?.connectionStatus, 'CONNECTED', '"us" should be CONNECTED')
  t.equal(cnaTestCompany?.connectionStatus, 'CONNECTED', '"cna test" should be CONNECTED')
  t.equal(testCompany?.connectionStatus, 'UNCONNECTED', '"test company" should be UNCONNECTED')
})
