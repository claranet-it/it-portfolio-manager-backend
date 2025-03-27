import { FastifyInstance } from 'fastify'
import { test, before, afterEach, after } from 'tap'
import createApp from '@src/app'
import { PrismaClient } from '../../../prisma/generated'
import { createCurriculum, getCurriculum } from '@test/utils/curriculum'
import { getToken } from '@test/utils/token'


let app: FastifyInstance
const prisma = new PrismaClient()

const FAKE_EMAIL = 'TEST_SAVEMINE@email.com'

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

afterEach(async () => {
    const deleteUser = prisma.curriculumVitae.deleteMany()
    const deleteEducation = prisma.education.deleteMany()
    const deleteWork = prisma.work.deleteMany()

    await prisma.$transaction([
        deleteWork,
        deleteEducation,
        deleteUser,
    ])
})

after(async () => {
    prisma.$disconnect()
    await app.close()
})

test('should return 401 saving curriculum without authentication', async (t) => {
    const response = await app.inject({
        method: 'POST',
        url: '/api/curriculum',
    })
    t.equal(response.statusCode, 401)
})

test('should return 400 if email is not valid', async (t) => {
    const notValidEmail = 'notvalidemail.com'
    const response = await createCurriculum(app, getToken(app, notValidEmail), { ...FAKE_CURRICULUM_DATA, email: notValidEmail })
    t.equal(response.statusCode, 400)
})

test('should return 500 if user email is different from curriculum email', async (t) => {
    const response = await createCurriculum(app, getToken(app, FAKE_EMAIL), { ...FAKE_CURRICULUM_DATA, email: 'another@email.com' })
    t.equal(response.statusCode, 500)
})

test('should create curriculum', async (t) => {
    const response = await createCurriculum(app, getToken(app, FAKE_EMAIL), FAKE_CURRICULUM_DATA)
    t.equal(response.statusCode, 204)

    const getResponse = await getCurriculum(app, getToken(app, FAKE_EMAIL))
    const getResponseData = getResponse.json()
    t.equal(getResponse.statusCode, 200)
    t.equal(getResponseData.work.length, 2)
    t.equal(getResponseData.education.length, 1)
    t.equal(getResponseData.email, FAKE_CURRICULUM_DATA.email)
    t.equal(getResponseData.name, FAKE_CURRICULUM_DATA.name)
})




