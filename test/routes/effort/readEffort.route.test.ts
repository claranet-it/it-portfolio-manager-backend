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
                }
            ]
        }
    ]

    t.same(efforts, expectedResult)
})

test('read next efforts without params', async t => {
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
        url: '/api/effort/next',
        headers: {
            authorization: `Bearer ${token}`
        }
    })

    t.equal(response.statusCode, 200)
    
    const efforts = response.json<EffortResponseType>()
    t.equal(efforts.length, 2)

    const now = new Date()
    const nextMonth1 = new Date()
    nextMonth1.setMonth(nextMonth1.getMonth() + 1)
    const nextMonth2 = new Date()
    nextMonth2.setMonth(nextMonth2.getMonth() + 2)
    const nextMonth3 = new Date()
    nextMonth3.setMonth(nextMonth3.getMonth() + 3)

    const expectedResult = [
        {
            "george.python":
            [
                {
                    "month_year": ("0" + (now.getMonth() + 1)).slice(-2) + "_" + now.getFullYear().toString().slice(-2),
                    "confirmedEffort": 0,
                    "tentativeEffort": 0,
                    "notes": ""
                },
                {
                    "month_year": ("0" + (nextMonth1.getMonth() + 1)).slice(-2) + "_" + nextMonth1.getFullYear().toString().slice(-2),
                    "confirmedEffort": 0,
                    "tentativeEffort": 0,
                    "notes": ""
                },
                {
                    "month_year": ("0" + (nextMonth2.getMonth() + 1)).slice(-2) + "_" + nextMonth2.getFullYear().toString().slice(-2),
                    "confirmedEffort": 0,
                    "tentativeEffort": 0,
                    "notes": ""
                },
                {
                    "month_year": ("0" + (nextMonth3.getMonth() + 1)).slice(-2) + "_" + nextMonth3.getFullYear().toString().slice(-2),
                    "confirmedEffort": 0,
                    "tentativeEffort": 0,
                    "notes": ""
                }
            ]
        },
        {
            "nicholas.crow@email.com":
            [
                {
                    "month_year": ("0" + (now.getMonth() + 1)).slice(-2) + "_" + now.getFullYear().toString().slice(-2),
                    "confirmedEffort": 0,
                    "tentativeEffort": 0,
                    "notes": ""
                },
                {
                    "month_year": ("0" + (nextMonth1.getMonth() + 1)).slice(-2) + "_" + nextMonth1.getFullYear().toString().slice(-2),
                    "confirmedEffort": 0,
                    "tentativeEffort": 0,
                    "notes": ""
                },
                {
                    "month_year": ("0" + (nextMonth2.getMonth() + 1)).slice(-2) + "_" + nextMonth2.getFullYear().toString().slice(-2),
                    "confirmedEffort": 0,
                    "tentativeEffort": 0,
                    "notes": ""
                },
                {
                    "month_year": ("0" + (nextMonth3.getMonth() + 1)).slice(-2) + "_" + nextMonth3.getFullYear().toString().slice(-2),
                    "confirmedEffort": 0,
                    "tentativeEffort": 0,
                    "notes": ""
                }
            ]
        }
    ]

    t.same(efforts, expectedResult)
})

test('read next efforts with uid param', async t => {
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
        url: '/api/effort/next?uid=nicholas.crow@email.com',
        headers: {
            authorization: `Bearer ${token}`
        }
    })

    t.equal(response.statusCode, 200)
    
    const efforts = response.json<EffortResponseType>()
    t.equal(efforts.length, 1)

    const now = new Date()
    const nextMonth1 = new Date()
    nextMonth1.setMonth(nextMonth1.getMonth() + 1)
    const nextMonth2 = new Date()
    nextMonth2.setMonth(nextMonth2.getMonth() + 2)
    const nextMonth3 = new Date()
    nextMonth3.setMonth(nextMonth3.getMonth() + 3)

    const expectedResult = [
        {
            "nicholas.crow@email.com":
            [
                {
                    "month_year": ("0" + (now.getMonth() + 1)).slice(-2) + "_" + now.getFullYear().toString().slice(-2),
                    "confirmedEffort": 0,
                    "tentativeEffort": 0,
                    "notes": ""
                },
                {
                    "month_year": ("0" + (nextMonth1.getMonth() + 1)).slice(-2) + "_" + nextMonth1.getFullYear().toString().slice(-2),
                    "confirmedEffort": 0,
                    "tentativeEffort": 0,
                    "notes": ""
                },
                {
                    "month_year": ("0" + (nextMonth2.getMonth() + 1)).slice(-2) + "_" + nextMonth2.getFullYear().toString().slice(-2),
                    "confirmedEffort": 0,
                    "tentativeEffort": 0,
                    "notes": ""
                },
                {
                    "month_year": ("0" + (nextMonth3.getMonth() + 1)).slice(-2) + "_" + nextMonth3.getFullYear().toString().slice(-2),
                    "confirmedEffort": 0,
                    "tentativeEffort": 0,
                    "notes": ""
                }
            ]
        }
    ]

    t.same(efforts, expectedResult)
})