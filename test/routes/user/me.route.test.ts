import {test} from "tap"
import createApp from "@src/app";
import {UserType} from "@models/user.model";

test('get user info', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    await app.ready()

    const token = app.createTestJwt({
        "https://claranet/email": "tester@claranet",
    })

    const response = await app.inject({
        method: 'GET',
        url: '/api/user/me',
        headers: {
            authorization: `Bearer ${token}`
        },
    })

    const user = response.json<UserType>()

    t.equal(response.statusCode, 200)
    t.equal(user.email, 'tester@claranet')
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

    t.equal(response.statusCode, 401, )
})
