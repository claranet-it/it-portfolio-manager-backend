import {test} from "tap"
import createApp from "@src/app";

test('save user profile', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    await app.ready()

    const token = app.createTestJwt({
        "email": "user@without.profile",
        "name": "User Without Profile",
        "picture": "https://test.com/user.without.profile.jpg",
    })

    const response = await app.inject({
        method: 'POST',
        url: '/api/user/profile',
        headers: {
            authorization: `Bearer ${token}`
        },
        payload: {
            crew: 'moon',
        }
    })

    t.equal(response.statusCode, 201)
})


test('save user profile without authentication', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    const response = await app.inject({
        method: 'POST',
        url: '/api/user/profile',
        payload: {
            crew: 'moon',
        }
    })

    t.equal(response.statusCode, 401)
})
