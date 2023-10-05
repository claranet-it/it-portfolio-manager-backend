import {test} from "tap"
import createApp from "@src/app";
import {SkillMatrixType} from "@models/skillMatrix.model";

test('read skill matrix without authentication', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    const response = await app.inject({
        method: 'GET',
        url: '/api/skill-matrix/',
    })

    t.equal(response.statusCode, 401)
})

test('read all skill matrix without params', async t => {
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
    })

    const response = await app.inject({
        method: 'GET',
        url: '/api/skill-matrix/',
        headers: {
            authorization: `Bearer ${token}`
        }
    })

    t.equal(response.statusCode, 400)
})

test('read all skill matrix with invalid params', async t => {
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
    })

    const response = await app.inject({
        method: 'GET',
        url: '/api/skill-matrix/?invalid_param=test',
        headers: {
            authorization: `Bearer ${token}`
        }
    })

    t.equal(response.statusCode, 400)
})

test('read all skill matrix with empty param', async t => {
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
    })

    const response = await app.inject({
        method: 'GET',
        url: '/api/skill-matrix/?invalid_param=',
        headers: {
            authorization: `Bearer ${token}`
        }
    })

    t.equal(response.statusCode, 400)
})

test('read all skill matrix with company param', async t => {
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
    })

    const response = await app.inject({
        method: 'GET',
        url: '/api/skill-matrix/?company=it',
        headers: {
            authorization: `Bearer ${token}`
        }
    })

    const userSkillMatrix = response.json<SkillMatrixType>()

    t.equal(response.statusCode, 200)
    t.equal(userSkillMatrix.length, 4)

    const expectedResult = [
        {
            "uid": "nicholas.crow@email.com",
            "company": "it",
            "crew": "moon",
            "skill": "PHP - Backend",
            "score": 4,
            "updatedAt": "2023-01-01T00:00:00.000Z"
        },
        {
            "uid": "george.python",
            "company": "it",
            "crew": "sun",
            "skill": "Python - Backend",
            "score": 3,
            "updatedAt": "2023-01-01T04:00:00.000Z"
        },
        {
            "uid": "nicholas.crow@email.com",
            "company": "it",
            "crew": "moon",
            "skill": "Java/Kotlin - Backend",
            "score": 3,
            "updatedAt": "2023-01-01T01:00:00.000Z"
        },
        {
            "uid": "george.python",
            "company": "it",
            "crew": "sun",
            "skill": "PHP - Backend",
            "score": 1,
            "updatedAt": "2023-01-01T02:00:00.000Z"
        }
    ]
    t.same(userSkillMatrix, expectedResult)
})
