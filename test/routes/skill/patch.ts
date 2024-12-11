import { test, before, after } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { seedCompany } from '@test/seed/prisma/company'
import { PrismaClient } from '../../../prisma/generated'
import { seedSkill } from '@test/seed/prisma/skill'

let app: FastifyInstance
const prisma = new PrismaClient()
let skillItId = 0
let skillUsId = 0

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
  await seedSkill()

  const firstSkill = await prisma.skill.findFirst({ orderBy: { id: 'asc' } })
  skillItId = firstSkill!.id

  const lastSkill = await prisma.skill.findFirst({ orderBy: { id: 'desc' } })
  skillUsId = lastSkill!.id
})

after(async () => {
  const deleteSkill = prisma.skill.deleteMany()
  const deleteCompany = prisma.company.deleteMany()

  await prisma.$transaction([deleteSkill, deleteCompany])
  await prisma.$disconnect()
  await app.close()
})

test('Patch skill without authentication', async (t) => {
  const response = await app.inject({
    method: 'PATCH',
    url: `/api/skill/${skillItId}`,
    body: {
      visible: false,
    },
  })
  t.equal(response.statusCode, 401)
})

test('Patch skill without ADMIN role', async (t) => {
  const tempToken = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it',
  })

  const response = await app.inject({
    method: 'PATCH',
    url: `/api/skill/${skillItId}`,
    headers: {
      authorization: `Bearer ${tempToken}`,
    },
    body: {
      visible: false,
    },
  })
  t.equal(response.statusCode, 403)
})

test('Patch skill not mine', async (t) => {
  const response = await app.inject({
    method: 'PATCH',
    url: `/api/skill/${skillUsId}`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    body: {
      visible: false,
    },
  })
  t.equal(response.statusCode, 403)
})

test('Patch skill', async (t) => {
  const response = await app.inject({
    method: 'PATCH',
    url: `/api/skill/${skillItId}`,
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    body: {
      visible: false,
    },
  })
  t.equal(response.statusCode, 200)

  const updatedSkill = await prisma.skill.findFirstOrThrow({
    where: {
      id: skillItId,
    },
  })
  t.equal(updatedSkill.visible, false)
})
