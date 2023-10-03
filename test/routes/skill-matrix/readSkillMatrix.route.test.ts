import {test} from "tap"
import createApp from "@src/app";
import {SkillMatrixType} from "@models/skillMatrix.model";

test('read skill matrix for a user', async t => {
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
        url: '/api/skill-matrix?uid=nicholas.crow@email.com',
        headers: {
            authorization: `Bearer ${token}`
        }
    })

    const userSkillMatrix = response.json<SkillMatrixType>()

    t.equal(response.statusCode, 200)
    t.equal(userSkillMatrix.length, 2)

    const expectedResult = [
        {
            "uid": "nicholas.crow@email.com",
            "company": "it",
            "crew": "moon",
            "skill": "Java/Kotlin - Backend",
            "score": 3,
            "updatedAt": "2023-01-01T01:00:00.000Z"
        },
        {
            "uid": "nicholas.crow@email.com",
            "company": "it",
            "crew": "moon",
            "skill": "PHP - Backend",
            "score": 4,
            "updatedAt": "2023-01-01T00:00:00.000Z"
        },
    ]
    t.same(userSkillMatrix, expectedResult)
})

test('read skill matrix without authentication', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    const response = await app.inject({
        method: 'GET',
        url: '/api/skill-matrix',
    })

    t.equal(response.statusCode, 401)
})
