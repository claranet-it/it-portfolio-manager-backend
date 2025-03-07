import { FastifyInstance } from 'fastify'
import { test, before, after } from 'tap'
import createApp from '@src/app'
import { PrismaClient } from '../../../prisma/generated'
import { getCurriculum } from '@test/utils/curriculum'
import { getToken } from '@test/utils/token'

let app: FastifyInstance
const prisma = new PrismaClient()

const FAKE_EMAIL = 'TEST_GETMINE@email.com'

const FAKE_CURRICULUM_DATA = {
  name: 'Terry',
  email: FAKE_EMAIL,
  role: 'developer',
  summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  main_skills: 'Agile, Management, jira',
  education: [{ note: 'Master\'s degree', institution: 'University', year_start: 2015, year_end: 2020, current: false }],
  work: [{ note: 'R&D', role: 'developer', institution: 'Company', year_start: 2020, year_end: 2025, current: false }, { note: 'Ricercatore', role: 'stage', institution: 'Company X', year_start: 2017, year_end: 2020, current: false }]
}

before(async () => {
  app = createApp({ logger: false })
  await app.ready()
})

after(async () => {
  const deleteUser = prisma.curriculumVitae.deleteMany()
  const deleteEducation = prisma.education.deleteMany()
  const deleteWork = prisma.work.deleteMany()

  await prisma.$transaction([
    deleteWork,
    deleteEducation,
    deleteUser,
  ])
  prisma.$disconnect()
  await app.close()
})

test('should return 401 getting business card without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/curriculum',
  })
  t.equal(response.statusCode, 401)
})

test('should return empty object if business card is not present', async (t) => {
  const response = await getCurriculum(app, getToken(app, FAKE_EMAIL))
  const responseData = response.json()
  t.equal(response.statusCode, 200)
  t.same(responseData, {})
})

test('should get own business card', async (t) => {
  const user = await prisma.curriculumVitae.create({
    data: {
      id: 'CurriculumTerry',
      name: 'Terry',
      email: FAKE_EMAIL,
      role: 'developer',
      summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      main_skills: 'Agile, Management, jira',
    }
  })
  await prisma.education.create({
    data: {
      note: 'Master\'s degree',
      institution: 'University',
      year_start: 2015,
      year_end: 2020,
      current: false,
      curriculum_id: user.id,
    }
  })
  await prisma.work.create({
    data: {
      note: 'Ricercatore',
      role: 'stage',
      institution: 'Company X',
      year_start: 2017,
      year_end: 2020,
      current: false,
      curriculum_id: user.id,
    }
  })
  await prisma.work.create({
    data: {
      note: 'R&D',
      role: 'developer',
      institution: 'Company',
      year_start: 2020,
      year_end: 2025,
      current: false,
      curriculum_id: user.id,
    }
  })


  const getResponse = await getCurriculum(app, getToken(app, FAKE_EMAIL))
  const getResponseData = getResponse.json()
  t.equal(getResponse.statusCode, 200)
  t.strictSame(getResponseData, FAKE_CURRICULUM_DATA)
})
