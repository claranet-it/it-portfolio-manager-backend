import { FastifyInstance } from 'fastify'
import { test, before, after } from 'tap'
import createApp from '@src/app'
import { PrismaClient } from '../../../prisma/generated'
import { addBusinessCard, getOwnBusinessCard } from '@test/utils/business-card'
import { getToken } from '@test/utils/token'

let app: FastifyInstance
const prisma = new PrismaClient()

const FAKE_EMAIL = 'TEST_GETMINE@email.com'

const FAKE_BUSINESS_CARD_DATA = {
  name: 'Nicholas Crow',
  email: FAKE_EMAIL,
  role: 'developer',
  mobile: '123456789',
}

before(async () => {
  app = createApp({ logger: false })
  await app.ready()
})

after(async () => {
  prisma.$disconnect()
  await app.close()
})

test('should return 401 getting business card without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/business-card',
  })
  t.equal(response.statusCode, 401)
})

test('should return empty object if business card is not present', async (t) => {
  const response = await getOwnBusinessCard(app, getToken(app, FAKE_EMAIL))
  const responseData = response.json()
  t.equal(response.statusCode, 200)
  t.same(responseData, {})
})

test('should get own business card', async (t) => {
  const response = await addBusinessCard(app, getToken(app, FAKE_EMAIL), FAKE_BUSINESS_CARD_DATA)
  t.equal(response.statusCode, 204)

  const getResponse = await getOwnBusinessCard(app, getToken(app, FAKE_EMAIL))
  const getResponseData = getResponse.json()
  t.equal(getResponse.statusCode, 200)
  t.same(getResponseData, FAKE_BUSINESS_CARD_DATA)

  await prisma.businessCard.delete({where: {email: FAKE_EMAIL}})
})
