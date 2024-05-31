import { afterEach, beforeEach, test } from 'tap'
import createApp from '@src/app'
import {
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

test('read networking skills without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/skill-matrix/networking',
  })

  t.equal(response.statusCode, 401)
})

test('read company networking skills', async (t) => {
  const company = 'test company'
  const token = getToken(company)
  const response = await app.inject({
    method: 'GET',
    url: '/api/skill-matrix/networking',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)
  console.log(response);

})
