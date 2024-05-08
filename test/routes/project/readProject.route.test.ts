import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import {ProjectRowType, ProjectsType} from "@src/core/Project/model/project";

let app: FastifyInstance;

beforeEach(async () => {
    app = createApp({logger: false});
    await app.ready();
})

afterEach(async () => {
    await app.close();
})

test('read project without authentication', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/project/',
    })

    t.equal(response.statusCode, 401)
})

test('read project without params', async (t) => {
    const token = app.createTestJwt({
        email: 'nicholas.crow@email.com',
        name: 'Nicholas Crow',
        picture: 'https://test.com/nicholas.crow.jpg',
    })

    const response = await app.inject({
        method: 'GET',
        url: '/api/project/',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 400)
})

test('read project with company param', async (t) => {
    const token = app.createTestJwt({
        email: 'nicholas.crow@email.com',
        name: 'Nicholas Crow',
        picture: 'https://test.com/nicholas.crow.jpg',
    })

    const response = await app.inject({
        method: 'GET',
        url: '/api/project/?company=it',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 200)

    const projects = response.json<ProjectsType>()
    t.equal(projects.length, 3)

    const expectedResult = [
        {
            uid: '018f4e84-0dd6-73fd-b100-de1747834e11',
            name: 'Progetto cliente 1',
            category: 'Cliente',
            company: 'it'
        },
        {
            uid: '018f4e82-7272-7bbb-ba0d-6ef78743cde2',
            name: 'Festività',
            category: 'Time off',
            company: 'it'
        },
        {
            uid: '018f4e82-4952-790c-8cb5-0b604bd8eb8d',
            name: 'Formazione',
            category: 'Slack time',
            company: 'it'
        }
    ]


    t.same(projects, expectedResult)
})

test('read project with uid without authentication', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/project/018f4e84-0dd6-73fd-b100-de1747834e11',
    })

    t.equal(response.statusCode, 401)
})

test('read project with uid', async (t) => {
    const token = app.createTestJwt({
        email: 'nicholas.crow@email.com',
        name: 'Nicholas Crow',
        picture: 'https://test.com/nicholas.crow.jpg',
    })

    const response = await app.inject({
        method: 'GET',
        url: '/api/project/018f4e84-0dd6-73fd-b100-de1747834e11',
        headers: {
            authorization: `Bearer ${token}`,
        },
    })

    t.equal(response.statusCode, 200)

    const project = response.json<ProjectRowType>()

    const expected = {
        uid: '018f4e84-0dd6-73fd-b100-de1747834e11',
        name: 'Progetto cliente 1',
        category: 'Cliente',
        company: 'it'
    }

    t.same(project, expected)
})
