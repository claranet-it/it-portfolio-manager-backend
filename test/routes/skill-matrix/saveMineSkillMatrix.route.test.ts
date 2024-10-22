import {test} from "tap"
import createApp from "@src/app";

test('update skill matrix for the logged user with only skill', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    await app.ready()

    const token = app.createTestJwt({
        "email": "nicholas.crow@email.com",
        "name": "Nicholas Crow",
        "picture": "https://test.com/nicholas.crow.jpg",
        "company": "it"
    })

    const response = await app.inject({
        method: 'PATCH',
        url: '/api/skill-matrix/mine',
        headers: {
            authorization: `Bearer ${token}`
        },
        payload: {
            skill: 'PHP - Backend'
        }
    })

    t.equal(response.statusCode, 400)
})

test('update skill matrix for the logged user with only score', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    await app.ready()

    const token = app.createTestJwt({
        "email": "nicholas.crow@email.com",
        "name": "Nicholas Crow",
        "picture": "https://test.com/nicholas.crow.jpg",
        "company": "it"
    })

    const response = await app.inject({
        method: 'PATCH',
        url: '/api/skill-matrix/mine',
        headers: {
            authorization: `Bearer ${token}`
        },
        payload: {
            score: 3
        }
    })

    t.equal(response.statusCode, 400)
})

test('update skill matrix for the logged user without skill category', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    await app.ready()

    const token = app.createTestJwt({
        "email": "george.python",
        "name": "George Python",
        "picture": "https://test.com/george.python.jpg",
        "company": "us"
    })

    const response = await app.inject({
        method: 'PATCH',
        url: '/api/skill-matrix/mine',
        headers: {
            authorization: `Bearer ${token}`
        },
        payload: {
            skill: 'C# - Backend',
            score: 2
        }
    })

    t.equal(response.statusCode, 400)
})

test('update skill matrix without authentication', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    const response = await app.inject({
        method: 'PATCH',
        url: '/api/skill-matrix/mine',
    })

    t.equal(response.statusCode, 401)
})

test('update skill matrix for the logged user without UserProfile', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    await app.ready()

    const token = app.createTestJwt({
        "email": "max.power@email.com",
        "name": "Max Power",
        "picture": "https://test.com/max.power.jpg",
        "company": "it"
    })

    const response = await app.inject({
        method: 'PATCH',
        url: '/api/skill-matrix/mine',
        headers: {
            authorization: `Bearer ${token}`
        },
        payload: {
            skill: 'Python - Backend',
            skillCategory: "Developer",
            score: 1
        }
    })

    t.equal(response.statusCode, 304)
})

test('update skill matrix for the logged user with no skill on DB', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    await app.ready()

    const token = app.createTestJwt({
        "email": "george.python@email.com",
        "name": "George Python",
        "picture": "https://test.com/george.python.jpg",
        "company": "us"
    })

    const response = await app.inject({
        method: 'PATCH',
        url: '/api/skill-matrix/mine',
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

test('update skill matrix for the logged user with skill on DB', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    await app.ready()

    const token = app.createTestJwt({
        "email": "george.python@email.com",
        "name": "George Python",
        "picture": "https://test.com/george.python.jpg",
        "company": "us"
    })

    const response = await app.inject({
        method: 'PATCH',
        url: '/api/skill-matrix/mine',
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

test('update skill matrix for the logged user with score 0', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    await app.ready()

    const token = app.createTestJwt({
        "email": "george.python@email.com",
        "name": "George Python",
        "picture": "https://test.com/george.python.jpg",
        "company": "us"
    })

    const response = await app.inject({
        method: 'PATCH',
        url: '/api/skill-matrix/mine',
        headers: {
            authorization: `Bearer ${token}`
        },
        payload: {
            skill: 'Python - Backend',
            skillCategory: "Developer",
            score: 0
        }
    })

    t.equal(response.statusCode, 204)
})

test('update skill matrix for the logged user with score outside max range', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    await app.ready()

    const token = app.createTestJwt({
        "email": "george.python@email.com",
        "name": "George Python",
        "picture": "https://test.com/george.python.jpg",
        "company": "it"
    })

    const response = await app.inject({
        method: 'PATCH',
        url: '/api/skill-matrix/mine',
        headers: {
            authorization: `Bearer ${token}`
        },
        payload: {
            skill: 'Python - Backend',
            skillCategory: "Developer",
            score: 4
        }
    })

    t.equal(response.statusCode, 400)
})

test('update skill matrix for the logged user with score outside min range', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    await app.ready()

    const token = app.createTestJwt({
        "email": "george.python@email.com",
        "name": "George Python",
        "picture": "https://test.com/george.python.jpg",
        "company": "it"
    })

    const response = await app.inject({
        method: 'PATCH',
        url: '/api/skill-matrix/mine',
        headers: {
            authorization: `Bearer ${token}`
        },
        payload: {
            skill: 'Python - Backend',
            skillCategory: "Developer",
            score: -1
        }
    })

    t.equal(response.statusCode, 400)
})