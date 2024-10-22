import { afterEach, beforeEach, test } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'

let app: FastifyInstance

beforeEach(async () => {
    app = createApp({ logger: false })
    await app.ready()
})

afterEach(async () => {
    await app.close()
})

test('update skill matrix without authentication', async t => {
    const response = await app.inject({
        method: 'PATCH',
        url: '/api/skill-matrix/micol.us@email.com',
    })

    t.equal(response.statusCode, 401)
})

test('update skill matrix as ADMIN', async t => {
    const token = app.createTestJwt({
        "email": "george.python@email.com",
        "name": "George Python",
        "picture": "https://test.com/george.python.jpg",
        "company": "us",
        "role": "ADMIN"
    })

    const response = await app.inject({
        method: 'PATCH',
        url: '/api/skill-matrix/micol.us@email.com',
        headers: {
            authorization: `Bearer ${token}`
        },
        payload: {
            skill: 'C# - Backend',
            skillCategory: "Developer",
            score: 2
        }
    })

    t.equal(response.statusCode, 204)
})

test('update skill matrix as TEAM_LEADER', async t => {
    const token = app.createTestJwt({
        "email": "george.python@email.com",
        "name": "George Python",
        "picture": "https://test.com/george.python.jpg",
        "company": "us",
        "role": "TEAM_LEADER"
    })

    const response = await app.inject({
        method: 'PATCH',
        url: '/api/skill-matrix/micol.us@email.com',
        headers: {
            authorization: `Bearer ${token}`
        },
        payload: {
            skill: 'Python - Backend',
            skillCategory: "Developer",
            score: 3
        }
    })

    t.equal(response.statusCode, 204)
})

test('update skill matrix for a different crew user as TEAM_LEADER', async t => {
    const token = app.createTestJwt({
        "email": "george.python@email.com",
        "name": "George Python",
        "picture": "https://test.com/george.python.jpg",
        "company": "us",
        "role": "TEAM_LEADER"
    })

    const response = await app.inject({
        method: 'PATCH',
        url: '/api/skill-matrix/anothercrew@email.com',
        headers: {
            authorization: `Bearer ${token}`
        },
        payload: {
            skill: 'Python - Backend',
            skillCategory: "Developer",
            score: 3
        }
    })

    t.equal(response.statusCode, 403)
})