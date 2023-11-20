import {test} from "tap"
import createApp from "@src/app";
import {SkillMatrixMineResponseType} from "@src/core/SkillMatrix/model/skillMatrix.model";

test('read skill matrix for the logged user', async t => {
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
        url: '/api/skill-matrix/mine',
        headers: {
            authorization: `Bearer ${token}`
        }
    })

    const userSkillMatrix = response.json<SkillMatrixMineResponseType>()

    t.equal(response.statusCode, 200)
    t.equal(userSkillMatrix.length, 2)

    const expectedResult = [
        {
            "uid": "nicholas.crow@email.com",
            "company": "it",
            "crew": "moon",
            "skill": "Java/Kotlin",
            "skillCategory": "",
            "score": 3,
            "updatedAt": "2023-01-01T01:00:00.000Z"
        },
        {
            "uid": "nicholas.crow@email.com",
            "company": "it",
            "crew": "moon",
            "skill": "PHP",
            "skillCategory": "Developer",
            "score": 3,
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
        url: '/api/skill-matrix/mine',
    })

    t.equal(response.statusCode, 401)
})
