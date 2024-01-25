import { test, beforeEach, afterEach } from "tap"
import createApp from "@src/app";
import { FastifyInstance } from "fastify";

let app: FastifyInstance;

beforeEach(async () => {
  app = createApp({logger: false});
  await app.ready();
})

afterEach(async () => {
  await app.close();
})

test('save effort without authentication', async t => {
    const response = await app.inject({
        method: 'PUT',
        url: '/api/effort/',
    })

    t.equal(response.statusCode, 401)
})

test('save effort with incomplete params', async t => {
    const token = app.createTestJwt({
        "email": "nicholas.crow@email.com",
        "name": "Nicholas Crow",
        "picture": "https://test.com/nicholas.crow.jpg",
    })

    const response = await app.inject({
        method: 'PUT',
        url: '/api/effort/',
        headers: {
            authorization: `Bearer ${token}`
        },
        payload: {
            uid: 'nicholas.crow@email.com',
        }
    })

    t.equal(response.statusCode, 400)
})

test('save effort greater than 100', async (t) => {
    const token = app.createTestJwt({
        "email": "nicholas.crow@email.com",
        "name": "Nicholas Crow",
        "picture": "https://test.com/nicholas.crow.jpg",
    })

    const response = await app.inject({
        method: 'PUT',
        url: '/api/effort/',
        headers: {
            authorization: `Bearer ${token}`
        },
        payload: {
            uid: 'nicholas.crow@email.com',
            month_year: '01_24',
            confirmedEffort: 60,
            tentativeEffort: 60,
            notes: ''
        }
    })

    t.equal(response.statusCode, 400)
    t.equal(response.body, JSON.stringify({message: 'Total effort for period January 24 is greater then 100'}))
})

test('insert effort', async t => {
    const token = app.createTestJwt({
        "email": "nicholas.crow@email.com",
        "name": "Nicholas Crow",
        "picture": "https://test.com/nicholas.crow.jpg",
    })

    const response = await app.inject({
        method: 'PUT',
        url: '/api/effort/',
        headers: {
            authorization: `Bearer ${token}`
        },
        payload: {
            uid: 'nicholas.crow@email.com',
            month_year: '03_23',
            confirmedEffort: 20,
            tentativeEffort: 80,
            notes: 'I-pgone',
        }
    })

    t.equal(response.statusCode, 204)
})

test('update effort', async t => {
    const token = app.createTestJwt({
        "email": "nicholas.crow@email.com",
        "name": "Nicholas Crow",
        "picture": "https://test.com/nicholas.crow.jpg",
    })

    const response = await app.inject({
        method: 'PUT',
        url: '/api/effort/',
        headers: {
            authorization: `Bearer ${token}`
        },
        payload: {
            uid: 'nicholas.crow@email.com',
            month_year: '03_23',
            confirmedEffort: 50,
            tentativeEffort: 0,
            notes: 'Scouting',
        }
    })

    t.equal(response.statusCode, 204)
})

test('update effort for the logged user without UserProfile', async t => {
    const token = app.createTestJwt({
        "email": "max.power@email.com",
        "name": "Max Power",
        "picture": "https://test.com/max.power.jpg",
    })

    const response = await app.inject({
        method: 'PUT',
        url: '/api/effort',
        headers: {
            authorization: `Bearer ${token}`
        },
        payload: {
            uid: 'max.power@email.com',
            month_year: '04_23',
            confirmedEffort: 50,
            tentativeEffort: 0,
            notes: 'Scouting'
        }
    })

    t.equal(response.statusCode, 304)
})