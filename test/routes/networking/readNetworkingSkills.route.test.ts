import { afterEach, beforeEach, test } from 'tap'
import createApp from '@src/app'
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
    url: '/api/networking/skills',
  })

  t.equal(response.statusCode, 401)
})

test('read company networking skills', async (t) => {
  const company = 'test company'
  const token = getToken(company)
  const response = await app.inject({
    method: 'GET',
    url: '/api/networking/skills',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  t.equal(response.statusCode, 200)

  const expected =  "[{\"company\":\"it\",\"skills\":[{\"skill\":\"PHP\",\"averageScore\":2,\"people\":2},{\"skill\":\"Java/Kotlin\",\"averageScore\":3,\"people\":1},{\"skill\":\"Python\",\"averageScore\":3,\"people\":1}]}]"
  t.same(response.payload, expected)
})
