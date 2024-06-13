import { afterEach, beforeEach, test } from 'tap'
import createApp from '@src/app'
import {
  SkillMatrixResponsePerUidType,
  SkillMatrixResponseType,
} from '@src/core/SkillMatrix/model/skillMatrix.model'
import { FastifyInstance } from 'fastify'

let app: FastifyInstance

function getToken(company: string): string {
  return app.createTestJwt({
    email: 'nicholas.crow@email.com',
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: company,
  })
}

beforeEach(async () => {
  app = createApp({ logger: false })
  await app.ready()
})

afterEach(async () => {
  await app.close()
})

test('read skill matrix without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/skill-matrix/',
  })

  t.equal(response.statusCode, 401)
})

test('read all skill matrix without params', async (t) => {
  const company = 'it'
  const token = getToken(company)
  const response = await app.inject({
    method: 'GET',
    url: '/api/skill-matrix/',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)

})

test('read all skill matrix with empty param', async (t) => {

  const response = await app.inject({
    method: 'GET',
    url: '/api/skill-matrix?company=',
    headers: {
      authorization: `Bearer ${getToken('it')}`,
    },
  })

  t.equal(response.statusCode, 200)
})

test('read all skill matrix with company param', async (t) => {

  const response = await app.inject({
    method: 'GET',
    url: '/api/skill-matrix?company=it',
    headers: {
      authorization: `Bearer ${getToken('it')}`,
    },
  })

  const userSkillMatrix = response.json<SkillMatrixResponseType>()

  t.equal(response.statusCode, 200)
  t.equal(userSkillMatrix.length, 2)
  const nicolasCrowExpected: SkillMatrixResponsePerUidType = {
    'Nicholas Crow': {
      company: 'it',
      crew: 'moon',
      skills: {
        PHP: 3,
        'Frontend (JS/TS)': 0,
        'NodeJS (JS/TS)': 0,
        'Native Android': 0,
        'Native iOS': 0,
        'Multiplatform Mobile (ionic, react-native, flutter)': 0,
        'UI Development (HTML/CSS/SCSS)': 0,
        'C#': 0,
        Python: 0,
        'Java/Kotlin': 3,
        Elixir: 0,
        'Ruby (Rails)': 0,
        Rust: 0,
        Serverless: 0,
        Data: 0,
        Networking: 0,
        Security: 0,
        ML: 0,
        'AWS Cloudformation': 0,
        'AWS ECS': 0,
        'AWS EKS': 0,
        'AWS cloud governance': 0,
        'AWS core': 0,
        'AWS finance': 0,
        'AWS migration': 0,
        'AWS monitoring': 0,
        'AWS streaming + IoT': 0,
        Terraform: 0,
      },
    },
  }
  const georgePythonExpected: SkillMatrixResponsePerUidType = {
    'George Python': {
      company: 'it',
      crew: 'sun',
      skills: {
        PHP: 1,
        'Frontend (JS/TS)': 0,
        'NodeJS (JS/TS)': 0,
        'Native Android': 0,
        'Native iOS': 0,
        'Multiplatform Mobile (ionic, react-native, flutter)': 0,
        'UI Development (HTML/CSS/SCSS)': 0,
        'C#': 0,
        Python: 3,
        'Java/Kotlin': 0,
        Elixir: 0,
        'Ruby (Rails)': 0,
        Rust: 0,
        Serverless: 0,
        Data: 0,
        Networking: 0,
        Security: 0,
        ML: 0,
        'AWS Cloudformation': 0,
        'AWS ECS': 0,
        'AWS EKS': 0,
        'AWS cloud governance': 0,
        'AWS core': 0,
        'AWS finance': 0,
        'AWS migration': 0,
        'AWS monitoring': 0,
        'AWS streaming + IoT': 0,
        Terraform: 0,
      },
    },
  }
  t.same(
    userSkillMatrix.find((res) => Object.keys(res)[0] === 'Nicholas Crow'),
    nicolasCrowExpected,
  )
  t.same(
    userSkillMatrix.find((res) => Object.keys(res)[0] === 'George Python'),
    georgePythonExpected,
  )
})
