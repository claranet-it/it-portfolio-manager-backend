import {test} from "tap"
import createApp from "@src/app";
import {UserWithProfileType} from "@src/core/User/model/user.model";

test('get user info without user profile', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    await app.ready()

    const token = app.createTestJwt({
        "email": "tester@claranet",
        "name": "Tester",
        "picture": "https://test.com/test.jpg",
        "company": "it"
    })

    const response = await app.inject({
        method: 'GET',
        url: '/api/user/me',
        headers: {
            authorization: `Bearer ${token}`
        },
    })

    const user = response.json<UserWithProfileType>()
    t.equal(response.statusCode, 200)
    t.equal(user.email, 'tester@claranet')
    t.equal(user.name, 'Tester')
    t.equal(user.picture, 'https://test.com/test.jpg')
    t.equal(user.company, 'it')
    t.notOk(user.crew)
    t.notOk(user.crewLeader)
    t.notOk(user.place)
    t.notOk(user.workingExperience)
    t.notOk(user.education)
    t.notOk(user.certifications)
})

test('get user info with user profile', async t => {
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
        method: 'GET',
        url: '/api/user/me',
        headers: {
            authorization: `Bearer ${token}`
        },
    })

    const user = response.json<UserWithProfileType>()

    t.equal(response.statusCode, 200)
    t.equal(user.email, 'nicholas.crow@email.com')
    t.equal(user.name, 'Nicholas Crow')
    t.equal(user.picture, 'https://test.com/nicholas.crow.jpg')
    t.equal(user.crew, 'moon')
    t.equal(user.company, 'it')
    t.equal(user.crewLeader, true)
    t.equal(user.place, 'Jesi')
    t.equal(user.workingExperience, 'APRA')
    t.equal(user.education, 'Bachelor Degree in Computer Science')
    t.equal(user.certifications, 'AWS Certified Developer - Associate')
})

test('get user info without authentication', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    const response = await app.inject({
        method: 'GET',
        url: '/api/user/me',
    })

    t.equal(response.statusCode, 401)
})

test('get user info with invalid token', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    await app.ready()

    const token = app.createTestJwt({
        "email_invalid": "nicholas.crow@email.com",
        "name_invalid": "Nicholas Crow",
        "picture_invalid": "https://test.com/nicholas.crow.jpg",
    })

    const response = await app.inject({
        method: 'GET',
        url: '/api/user/me',
        headers: {
            authorization: `Bearer ${token}`
        },
    })

    t.equal(response.statusCode, 401)
})
