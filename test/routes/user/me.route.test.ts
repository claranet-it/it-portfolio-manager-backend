import {test} from "tap"
import createApp from "@src/app";
import {UserWithProfileType} from "@models/user.model";

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
    t.notOk(user.crew)
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
