import { FastifyInstance } from 'fastify'
import { test, before, after } from 'tap'
import createApp from '@src/app'
import { PrismaClient } from '../../../prisma/generated'
import { getToken } from '@test/utils/token'
import { updateEducation } from '@test/utils/curriculum'


let app: FastifyInstance
const prisma = new PrismaClient()

const FAKE_EMAIL = 'TEST_UPDATEEDUCATION@email.com'

const FAKE_ID = 'UPDATE_ID'

const UPDATE_STRING = "UPDATE FIELD STRING"

const UPDATE_NUMBER = 2030

const UPDATE_BOOLEAN = true

before(async () => {
    app = createApp({ logger: false })
    await app.ready()

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
            id: FAKE_ID,
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
            note: 'R&D',
            role: 'developer',
            institution: 'Company',
            year_start: 2020,
            year_end: 2025,
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

test('should return 401 update curriculum without authentication', async (t) => {
    const response = await app.inject({
        method: 'PATCH',
        url: '/api/education/id',
    })
    t.equal(response.statusCode, 401)
})


test('should update education element of my curriculum', async (t) => {
    await updateEducation(app, getToken(app, FAKE_EMAIL), FAKE_ID, { note: UPDATE_STRING, year_start: UPDATE_NUMBER, current: UPDATE_BOOLEAN })
    const updatedEducation = await prisma.education.findUnique({ where: { id: FAKE_ID } })
    t.equal(updatedEducation?.note, UPDATE_STRING)
    t.equal(updatedEducation?.year_start, UPDATE_NUMBER)
    t.equal(updatedEducation?.current, UPDATE_BOOLEAN)
})





