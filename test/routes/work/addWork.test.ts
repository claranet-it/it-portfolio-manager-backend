import { FastifyInstance } from 'fastify'
import { test, before, after } from 'tap'
import createApp from '@src/app'
import { PrismaClient } from '../../../prisma/generated'
import { getToken } from '@test/utils/token'
import { addWork } from '@test/utils/curriculum'


let app: FastifyInstance
const prisma = new PrismaClient()

const FAKE_EMAIL = 'TEST_ADDWORK@email.com'

const ADD_NOTE = 'ADD_NOTE'

const ADD_ROLE = 'ADD_ROLE'

const ADD_COMPANY = 'ADD_COMPANY'

const ADD_YEAR = 2000

const ID_CV = 'CurriculumTerry'

const FAKE_ELEMENT = {
    note: ADD_NOTE,
    institution: ADD_COMPANY,
    year_start: ADD_YEAR,
    role: ADD_ROLE,
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
        url: '/api/work/',
    })
    t.equal(response.statusCode, 401)
})


test('should add education element in my curriculum', async (t) => {
    await addWork(app, getToken(app, FAKE_EMAIL), FAKE_ELEMENT)
    const cv = await prisma.curriculumVitae.findUnique({ where: { id: ID_CV }, include: { work: true } })
    if (!cv) {
        return
    }
    const workItem = cv.work[0]
    t.equal(workItem.note, ADD_NOTE)
    t.equal(workItem.year_start, ADD_YEAR)
    t.equal(workItem.institution, ADD_COMPANY)
    t.equal(workItem.role, ADD_ROLE)
})
