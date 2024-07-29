import createApp from "@src/app";
import {FastifyInstance} from "fastify";
import {test, beforeEach, afterEach} from 'tap'
import {TimeEntriesForCnaListType} from "@src/core/TimeEntry/model/timeEntry.model";

let app: FastifyInstance
beforeEach(async () => {
    app = createApp({logger: false})
    await app.ready()
})

afterEach(async () => {
    await app.close()
})

test('Read users without api key', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/user/profiles?company=it',
    })
    t.equal(response.statusCode, 401)
})

test('Read users with invalid api key', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/user/profiles?company=it',
        headers: {
            'X-Api-Key': `1243`,
        },
    })
    t.equal(response.statusCode, 401)
})

test('Read users profiles - it', async t => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/user/profiles?company=it',
        headers: {
            'X-Api-Key': `1234`,
        },
    })
    t.equal(response.statusCode, 200)
    const result = response.json<TimeEntriesForCnaListType>()
    t.equal(result.length, 3)

   const expected = [
        {
            "email": "micol.ts@email.com",
            "id": "micol.ts@email.com",
            "name": "Micol Panetta",
        },
        {
            "email": "nicholas.crow@email.com",
            "id": "nicholas.crow@email.com",
            "name": "Nicholas Crow",
        },
        {
            "email": "testIt@test.com",
            "id": "testIt@test.com",
            "name": "test italian",
        },
    ]
    t.same(result, expected)
})

test('Read users profiles - flowing', async t => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/user/profiles?company=flowing',
        headers: {
            'X-Api-Key': `1234`,
        },
    })
    t.equal(response.statusCode, 200)
    const result = response.json<TimeEntriesForCnaListType>()
    t.equal(result.length, 2)

    const expected = [
        {
            "email": "stefania.ceccacci@claranet.com",
            "id": "stefania.ceccacci@claranet.com",
            "name": "Stefania Ceccacci"
        },
        {
            "email": "manuel.gherardi@claranet.com",
            "id": "manuel.gherardi@claranet.com",
            "name": "Manuel Gherardi"
        }
    ]
    t.same(result, expected)
})