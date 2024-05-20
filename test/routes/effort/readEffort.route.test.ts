import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { EffortResponseType } from '@src/core/Effort/model/effort'
import { FastifyInstance } from 'fastify'

let app: FastifyInstance;

beforeEach(async () => {
  app = createApp({logger: false});
  await app.ready();
})

afterEach(async () => {
  await app.close();
})

test('read efforts without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/effort/',
  })

  t.equal(response.statusCode, 401)
})

test('read all efforts without params', async (t) => {
  const token = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it'
  })

  const response = await app.inject({
    method: 'GET',
    url: '/api/effort/',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)

  const efforts = response.json<EffortResponseType>()
  t.equal(efforts.length, 2)

  const expectedResult = [
    {
      'george.python@email.com': {
        crew: 'sun',
        company: 'us',
        name: 'George Python',
        effort: [
          {
            month_year: '01_23',
            confirmedEffort: 80,
            tentativeEffort: 0,
            notes: 'Moovtech',
          },
          {
            month_year: '02_23',
            confirmedEffort: 50,
            tentativeEffort: 0,
            notes: 'Moovtech',
          },
        ],
      },
    },
    {
      'nicholas.crow@email.com': {
        crew: 'moon',
        company: 'us',
        name: 'Nicholas Crow',
        effort: [
          {
            month_year: '01_23',
            confirmedEffort: 50,
            tentativeEffort: 0,
            notes: 'Scouting',
          },
          {
            month_year: '02_23',
            confirmedEffort: 50,
            tentativeEffort: 30,
            notes: 'Scouting + Carimali',
          },
        ],
      },
    },
  ]

  t.same(efforts, expectedResult)
})

test('read all efforts with uid param', async (t) => {
  const token = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it'
  })

  const response = await app.inject({
    method: 'GET',
    url: '/api/effort/?uid=nicholas.crow@email.com',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)

  const efforts = response.json<EffortResponseType>()
  t.equal(efforts.length, 1)

  const expectedResult = [
    {
      'nicholas.crow@email.com': {
        crew: 'moon',
        company: 'us',
        name: 'Nicholas Crow',
        effort: [
          {
            month_year: '01_23',
            confirmedEffort: 50,
            tentativeEffort: 0,
            notes: 'Scouting',
          },
          {
            month_year: '02_23',
            confirmedEffort: 50,
            tentativeEffort: 30,
            notes: 'Scouting + Carimali',
          },
        ],
      },
    },
  ]

  t.same(efforts, expectedResult)
})

test('read next efforts without params', async (t) => {

  const token = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it'
  })

  const response = await app.inject({
    method: 'GET',
    url: '/api/effort/next',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)

  const efforts = response.json<EffortResponseType>()
  t.equal(efforts.length, 3)

  const expectedResult = [
    {
      'george.python@email.com': {
        crew: 'sun',
        company: 'us',
        name: 'George Python',
        effort: nextMonthsEmptyEffort(3),
      },
    },
    {
      'nicholas.crow@email.com': {
        crew: 'moon',
        company: 'us',
        name: 'Nicholas Crow',
        effort: nextMonthsEmptyEffort(3),
      },
    },
    {
    'testIt@test.com': {
      crew: 'bees',
      company: 'it',
      name: 'test italian',
      effort: nextMonthsEmptyEffort(3),
    },
  },
  ]
  t.same(efforts, expectedResult)
})

test('read next efforts with uid param', async (t) => {

  const token = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it'
  })

  const response = await app.inject({
    method: 'GET',
    url: '/api/effort/next?uid=nicholas.crow@email.com',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)

  const efforts = response.json<EffortResponseType>()
  t.equal(efforts.length, 1)

  const expectedResult = [
    {
      'nicholas.crow@email.com': {
        crew: 'moon',
        company: 'us',
        name: 'Nicholas Crow',
        effort: nextMonthsEmptyEffort(3),
      },
    },
  ]

  t.same(efforts, expectedResult)
})

test('read effort with months param', async (t) =>{
  const token = app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it'
  })

  const response = await app.inject({
    method: 'GET',
    url: '/api/effort/next?months=2',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)
  const expectedResult = [
    {
      'george.python@email.com': {
        crew: 'sun',
        company: 'us',
        name: 'George Python',
        effort: nextMonthsEmptyEffort(2),
      },
    },
    {
      'nicholas.crow@email.com': {
        crew: 'moon',
        company: 'us',
        name: 'Nicholas Crow',
        effort: nextMonthsEmptyEffort(2),
      },
    },
    {
    'testIt@test.com': {
      crew: 'bees',
      company: 'it',
      name: 'test italian',
      effort: nextMonthsEmptyEffort(2),
    },
  },
  ]
  const efforts = response.json<EffortResponseType>()
  t.same(efforts, expectedResult)
})

const inputs = [
  {
    company: 'us',
    expctedUsers: [
      {
        uid: 'nicholas.crow@email.com',
        crew: "moon",
        company: "us",
        name: "Nicholas Crow"
      }, 
      {
        uid: 'george.python@email.com',
        crew: "sun",
        company: "us",
        name: "George Python"
      }
      ]
  },
  {
    company: 'it',
    expctedUsers: [
      {
        uid: "testIt@test.com",
        crew: "bees",
        company: "it",
        name : "test italian"
      }
    ]
  }
]

inputs.forEach((input) => {
  test(`read next effort with company param ${input.company}`, async (t) =>{
    const token = app.createTestJwt({
      email: 'nicholas.crow@email.com',
      name: 'Nicholas Crow',
      picture: 'https://test.com/nicholas.crow.jpg',
      company: 'it'
    })
  
    const response = await app.inject({
      method: 'GET',
      url: `/api/effort/next?company=${input.company}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
  
    t.equal(response.statusCode, 200)
    const efforts = response.json<EffortResponseType>()
    t.equal(efforts.length, input.expctedUsers.length)

 
    input.expctedUsers.forEach((user) => {
      const effort = efforts.find((effort) => Object.keys(effort)[0] === user.uid);
      if(!effort){
        t.fail(`user ${user.uid} not found`)
        return;
      }
      t.same(effort[user.uid].company, user.company);
      t.same(effort[user.uid].crew, user.crew);
      t.same(effort[user.uid].name, user.name);
      t.same(effort[user.uid].effort, nextMonthsEmptyEffort(3))
    })
  } )
})


function nextMonthsEmptyEffort(months: number) {
  const now = new Date()
  const result = [];
    result.push( {
      month_year:
        ('0' + (now.getMonth() + 1)).slice(-2) +
        '_' +
        now.getFullYear().toString().slice(-2),
      confirmedEffort: 0,
      tentativeEffort: 0,
      notes: '',
    });
    for(let i = 0 ; i< months; i++){
      const month = new Date()
      month.setDate(1)
      month.setMonth(month.getMonth() + i +1)
      result.push({
        month_year:
        ('0' + (month.getMonth() + 1)).slice(-2) +
        '_' +
        month.getFullYear().toString().slice(-2),
      confirmedEffort: 0,
      tentativeEffort: 0,
      notes: '',
      })
    }
   return result
}
