import { test } from "tap"
import createApp from "@src/app";
import { SkillMatrixMineResponseType } from "@src/core/SkillMatrix/model/skillMatrix.model";

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
        url: '/api/skill-matrix?invalid_param=test',
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
        url: '/api/skill-matrix?company=',
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
        url: '/api/skill-matrix?company=it',
        headers: {
            authorization: `Bearer ${token}`
        }
    })

    const userSkillMatrix = response.json<SkillMatrixMineResponseType>()

    t.equal(response.statusCode, 200)
    t.equal(userSkillMatrix.length, 2)

    const expectedResult = [
        {
            "George Python": {
                "company": "it",
                "crew": "sun",
                "skills": {
                    "PHP": 1,
                    "Frontend (JS/TS)": 0,
                    "NodeJS (JS/TS)": 0,
                    "Native Android": 0,
                    "Native iOS": 0,
                    "Multiplatform Mobile (ionic, react-native, flutter)": 0,
                    "UI Development (HTML/CSS/SCSS)": 0,
                    "C#": 0,
                    "Python": 3,
                    "Java/Kotlin": 0,
                    "Elixir": 0,
                    "Ruby (Rails)": 0,
                    "Rust": 0,
                    'Serverless': 0,
                    'Data': 0,
                    'Networking': 0,
                    'Container': 0,
                    'Security': 0,
                    'IaC': 0,
                    'ML': 0
                },
            },
        },
        {
            "Nicholas Crow": {
                "company": "it",
                "crew": "moon",
                "skills": {
                    "PHP": 3,
                    "Frontend (JS/TS)": 0,
                    "NodeJS (JS/TS)": 0,
                    "Native Android": 0,
                    "Native iOS": 0,
                    "Multiplatform Mobile (ionic, react-native, flutter)": 0,
                    "UI Development (HTML/CSS/SCSS)": 0,
                    "C#": 0,
                    "Python": 0,
                    "Java/Kotlin": 3,
                    "Elixir": 0,
                    "Ruby (Rails)": 0,
                    "Rust": 0,
                    'Serverless': 0,
                    'Data': 0,
                    'Networking': 0,
                    'Container': 0,
                    'Security': 0,
                    'IaC': 0,
                    'ML': 0
                }
            }
        }
    ]
    t.same(userSkillMatrix, expectedResult)
})
