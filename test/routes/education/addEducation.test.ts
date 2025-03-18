import { FastifyInstance } from 'fastify'
import { test, before, after } from 'tap'
import createApp from '@src/app'
import { PrismaClient } from '../../../prisma/generated'
import { getToken } from '@test/utils/token'
import { addEducation } from '@test/utils/curriculum'


let app: FastifyInstance
const prisma = new PrismaClient()

const FAKE_EMAIL = 'TEST_ADDEDUCATION@email.com'

const ADD_NOTE = 'ADD_NOTE'

const ADD_SCHOOL = 'ADD_SCHOOL'

const ADD_YEAR = 2000

const ID_CV = 'CurriculumTerry'

const FAKE_ELEMENT = {
    note: ADD_NOTE,
    institution: ADD_SCHOOL,
    year_start: ADD_YEAR,
    year_end: 2005,
    current: false,
}

before(async () => {
    app = createApp({ logger: false })
    await app.ready()

    await prisma.curriculumVitae.create({
        data: {
            id: ID_CV,
            name: 'Terry',
            email: FAKE_EMAIL,
            role: 'developer',
            summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            main_skills: 'Agile, Management, jira',
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
        method: 'POST',
        url: '/api/education/',
    })
    t.equal(response.statusCode, 401)
})


test('should add education element in my curriculum', async (t) => {
    await addEducation(app, getToken(app, FAKE_EMAIL), FAKE_ELEMENT)
    const cv = await prisma.curriculumVitae.findUnique({ where: { id: ID_CV }, include: { education: true } })
    if (!cv) {
        return
    }
    const eduItem = cv.education[0]
    t.equal(eduItem.note, ADD_NOTE)
    t.equal(eduItem.year_start, ADD_YEAR)
    t.equal(eduItem.institution, ADD_SCHOOL)
})
