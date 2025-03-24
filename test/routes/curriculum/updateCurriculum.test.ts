import { FastifyInstance } from 'fastify'
import { test, before, after } from 'tap'
import createApp from '@src/app'
import { PrismaClient } from '../../../prisma/generated'
import { getToken } from '@test/utils/token'
import { getCurriculum, updateCurriculum } from '@test/utils/curriculum'


let app: FastifyInstance
const prisma = new PrismaClient()

const FAKE_EMAIL = 'TEST_UPDATECURRICULUM@email.com'

const UPDATE_STRING_1 = "UPDATE FIELD STRING 1"

const UPDATE_STRING_2 = "UPDATE FIELD STRING 2"

const UPDATE_STRING_1000 = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris eget diam molestie, porta est sit amet, finibus enim. Integer mattis feugiat sem at ornare. In mi magna, auctor nec accumsan laoreet, laoreet ac ante. Phasellus fermentum est sed arcu mollis blandit. Nunc efficitur sapien et est molestie dictum. Nulla bibendum faucibus vestibulum. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.Nam nec sapien quis lacus placerat porttitor euismod ut diam. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec libero dui, venenatis nec lacus non, tempor pulvinar mauris. Cras nec enim ex. Donec in facilisis urna, et iaculis mauris. Proin dignissim accumsan elit ut mollis. Donec et felis eget nunc commodo consectetur vel at metus. Phasellus convallis, risus maximus venenatis pellentesque, nunc nunc convallis ipsum, eget dignissim neque ante eu urna. Class aptent taciti sociosqu ad litora torquent per at."

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
        url: '/api/curriculum',
    })
    t.equal(response.statusCode, 401)
})

test('should not update name or email curriculum', async (t) => {
    // @ts-expect-error test email not change
    await updateCurriculum(app, getToken(app, FAKE_EMAIL), { email: "Marytex" })
    const getResponse = await getCurriculum(app, getToken(app, FAKE_EMAIL))
    const getResponseData = getResponse.json()
    t.equal(getResponse.statusCode, 200)

    t.equal(getResponseData.email, FAKE_EMAIL)
})

test('should update one item of my curriculum', async (t) => {
    {
        await updateCurriculum(app, getToken(app, FAKE_EMAIL), { role: UPDATE_STRING_1 })
        const getResponse = await getCurriculum(app, getToken(app, FAKE_EMAIL))
        const getResponseData = getResponse.json()
        t.equal(getResponse.statusCode, 200)

        t.equal(getResponseData.role, UPDATE_STRING_1)
    }

    {
        await updateCurriculum(app, getToken(app, FAKE_EMAIL), { summary: UPDATE_STRING_2 })
        const getResponse = await getCurriculum(app, getToken(app, FAKE_EMAIL))
        const getResponseData = getResponse.json()
        t.equal(getResponse.statusCode, 200)

        t.equal(getResponseData.summary, UPDATE_STRING_2)
    }
})

test('should update more item of my curriculum', async (t) => {

    await updateCurriculum(app, getToken(app, FAKE_EMAIL), { role: UPDATE_STRING_1, summary: UPDATE_STRING_2 })
    const getResponse = await getCurriculum(app, getToken(app, FAKE_EMAIL))
    const getResponseData = getResponse.json()
    t.equal(getResponse.statusCode, 200)

    t.equal(getResponseData.role, UPDATE_STRING_1)
    t.equal(getResponseData.summary, UPDATE_STRING_2)
})

test('should update description with more than 191 char', async (t) => {
    await updateCurriculum(app, getToken(app, FAKE_EMAIL), { main_skills: UPDATE_STRING_1000, summary: UPDATE_STRING_1000 })
    const getResponse = await getCurriculum(app, getToken(app, FAKE_EMAIL))
    const getResponseData = getResponse.json()
    t.equal(getResponse.statusCode, 200)
    t.equal(getResponseData.summary, UPDATE_STRING_1000)
    t.equal(getResponseData.main_skills, UPDATE_STRING_1000)
})



