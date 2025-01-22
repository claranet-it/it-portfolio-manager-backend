import { FastifyInstance } from 'fastify'
import { test, before, after } from 'tap'
import createApp from '@src/app'
import { PrismaClient } from '../../../prisma/generated'
import { addBusinessCard } from '@test/utils/business-card'
import { getToken } from '@test/utils/token'

let app: FastifyInstance
const prisma = new PrismaClient()

const FAKE_EMAIL = 'TEST_SAVEMINE@email.com'

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

test('should return 401 saving business card without authentication', async (t) => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/business-card',
  })
  t.equal(response.statusCode, 401)
})


test('should save business card', async (t) => {
  const response = await addBusinessCard(app, getToken(app, FAKE_EMAIL), FAKE_BUSINESS_CARD_DATA)
  t.equal(response.statusCode, 204)

  const bc = await prisma.businessCard.findUnique({where: {email: FAKE_EMAIL}})
  t.equal(bc?.name, FAKE_BUSINESS_CARD_DATA.name)
})

test('should return 500 if user email is different from business card email', async (t) => {
  const response = await addBusinessCard(app, getToken(app, FAKE_EMAIL), {...FAKE_BUSINESS_CARD_DATA, email: 'another@email.com'})
  t.equal(response.statusCode, 500)
})

test('should update business card', async (t) => {
  let response = await addBusinessCard(app, getToken(app, FAKE_EMAIL), FAKE_BUSINESS_CARD_DATA)
  t.equal(response.statusCode, 204)

  const bc = await prisma.businessCard.findUnique({where: {email: FAKE_EMAIL}})
  t.equal(bc?.name, FAKE_BUSINESS_CARD_DATA.name)

  const newName = 'Nicholas Crow 2'
  response = await addBusinessCard(app, getToken(app, FAKE_EMAIL), {...FAKE_BUSINESS_CARD_DATA, name: newName})
  t.equal(response.statusCode, 204)

  const updatedBc = await prisma.businessCard.findUnique({where: {email: FAKE_EMAIL}})
  t.equal(updatedBc?.name, newName)
})
