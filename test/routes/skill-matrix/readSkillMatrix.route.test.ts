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
        'C#': 0,
        Docker: 0,
        Elixir: 0,
        'Frontend (JS/TS)': 0,
        'Headless CMS': 0,
        'Java/Kotlin': 3,
        'Multiplatform Mobile': 0,
        'Native Android': 0,
        'Native iOS': 0,
        'NodeJS (JS/TS)': 0,
        NoSQL: 0,
        PHP: 3,
        Python: 0,
        Ruby: 0,
        Rust: 0,
        SQL: 0,
        'UI Development': 0,
        'AWS CloudFormation / Azure Resource Manager': 0,
        'AWS ECS / Azure Kubernetes Service / Azure Container Instances': 0,
        'AWS EC2 / Azure Virtual Machines': 0,
        'AWS EKS / Azure Kubernetes Service': 0,
        'AWS Lambda / Azure functions': 0,
        'AWS cloud governance / Azure Policy / Azure Blueprints': 0,
        'AWS core': 0,
        'AWS finance / Azure Policy / Azure Blueprints': 0,
        'AWS migration / Azure Migrate': 0,
        'AWS monitoring / Azure Monitor': 0,
        'AWS streaming + IoT / Azure IoT Hub / Azure Stream Analytics / Azure Event Hubs': 0,
        Cognito: 0,
        DB: 0,
        Data: 0,
        ML: 0,
        Networking: 0,
        Openshift: 0,
        'S3 / Blob': 0,
        SQS: 0,
        Security: 0,
        Serverless: 0,
        Terraform: 0,
        VM: 0,
        Agile: 0,
        'Gestione progetto': 0,
        Animation: 0,
        'Design systems': 0,
        'Mobile app': 0,
        Prototyping: 0,
        'User Experience': 0,
        'Ux Writing': 0,
        Visual: 0,
        'Web app': 0,
      },
    },
  }

  t.same(
    userSkillMatrix.find((res) => Object.keys(res)[0] === 'Nicholas Crow'),
    nicolasCrowExpected,
  )
})
