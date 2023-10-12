import {test} from "tap"
import createApp from "@src/app";
import {ConfigurationType} from "@models/configuration.model";

test('get all configuration', async t => {
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
        url: '/api/configuration',
        headers: {
            authorization: `Bearer ${token}`
        },
    })

    const configuration = response.json<ConfigurationType>()

    t.equal(response.statusCode, 200)

    // check if the configuration object has keys crews, skills and scoreRange
    t.equal(Object.keys(configuration).length, 3)
    t.equal(Object.keys(configuration).includes('crews'), true)
    t.equal(Object.keys(configuration).includes('skills'), true)
    t.equal(Object.keys(configuration).includes('scoreRange'), true)
    t.equal(configuration.crews.length, 6)
    t.equal(configuration.skills.Developer.length, 13)
    t.equal(configuration.skills.Cloud.length, 21)
    t.equal(configuration.scoreRange.min, 1)
    t.equal(configuration.scoreRange.max, 3)
})

test('get all configuration without authentication', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    const response = await app.inject({
        method: 'GET',
        url: '/api/configuration',
    })

    t.equal(response.statusCode, 401)
})
