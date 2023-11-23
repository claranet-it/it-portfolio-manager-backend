import { test } from "tap"
import createApp from "@src/app";
import { EffortResponseType } from "@src/core/Effort/model/effort";

test('read efforts without authentication', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    const response = await app.inject({
        method: 'GET',
        url: '/api/effort/',
    })

    t.equal(response.statusCode, 401)
})

test('read all efforts without params', async t => {
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
        url: '/api/effort/',
        headers: {
            authorization: `Bearer ${token}`
        }
    })

    t.equal(response.statusCode, 200)
    
    const efforts = response.json<EffortResponseType>()
    t.equal(efforts.length, 2)

    const expectedResult = [
        {
            "george.python":
            [
                {
                    "month_year": "01_23",
                    "confirmedEffort": 80,
                    "tentativeEffort": 0,
                    "notes": "Moovtech"
                },
                {
                    "month_year": "02_23",
                    "confirmedEffort": 50,
                    "tentativeEffort": 0,
                    "notes": "Moovtech"
                }
            ]
        },
        {
            "nicholas.crow@email.com":
            [
                {
                    "month_year": "01_23",
                    "confirmedEffort": 50,
                    "tentativeEffort": 0,
                    "notes": "Scouting"
                },
                {
                    "month_year": "02_23",
                    "confirmedEffort": 50,
                    "tentativeEffort": 30,
                    "notes": "Scouting + Carimali"
                },
                {
                    "month_year": "03_23",
                    "confirmedEffort": 50,
                    "tentativeEffort": 0,
                    "notes": "Scouting"
                }
            ]
        }
    ]

    t.same(efforts, expectedResult)
})

test('read all efforts with uid param', async t => {
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
        url: '/api/effort/?uid=nicholas.crow@email.com',
        headers: {
            authorization: `Bearer ${token}`
        }
    })

    t.equal(response.statusCode, 200)
    
    const efforts = response.json<EffortResponseType>()
    t.equal(efforts.length, 1)

    const expectedResult = [
        {
            "nicholas.crow@email.com":
            [
                {
                    "month_year": "01_23",
                    "confirmedEffort": 50,
                    "tentativeEffort": 0,
                    "notes": "Scouting"
                },
                {
                    "month_year": "02_23",
                    "confirmedEffort": 50,
                    "tentativeEffort": 30,
                    "notes": "Scouting + Carimali"
                },
                {
                    "month_year": "03_23",
                    "confirmedEffort": 50,
                    "tentativeEffort": 0,
                    "notes": "Scouting"
                }
            ]
        }
    ]

    t.same(efforts, expectedResult)
})