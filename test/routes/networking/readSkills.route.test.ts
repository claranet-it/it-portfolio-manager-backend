import { afterEach, beforeEach, test } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { NetworkingSkillsResponseType } from '@src/core/Networking/model/networking.model'
import { seedCompany } from '@test/seed/prisma/company'
import { PrismaClient } from '../../../prisma/generated'
import * as fs from 'node:fs'
import * as path from 'node:path'

let app: FastifyInstance
const prisma = new PrismaClient()

function getToken(company: string): string {
  return app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: company,
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

test('read networking skills without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/networking/skills',
  })

  t.equal(response.statusCode, 401)
})

test('read company networking skills of it', async (t) => {
  const company = 'it'
  const token = getToken(company)
  const response = await app.inject({
    method: 'GET',
    url: '/api/networking/skills',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)
  const result = JSON.stringify(
    response.json<NetworkingSkillsResponseType>(),
    null,
    2,
  )

  const expected = fs
    .readFileSync(
      path.resolve(
        __dirname,
        '../../fixtures/networking',
        'readSkillsExpected.json',
      ),
      'utf-8',
    )
    .trim()

  t.same(result, expected)
})

test('read company networking skills of other', async (t) => {
  const company = 'test company'
  const token = getToken(company)
  const response = await app.inject({
    method: 'GET',
    url: '/api/networking/skills',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)
  t.same(response.payload, '[]')
})
