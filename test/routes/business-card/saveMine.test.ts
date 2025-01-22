import { FastifyInstance } from 'fastify'
import { test, before, after } from 'tap'
import createApp from '@src/app'
import { BusinessCardType } from '@src/core/BusinessCard/model'
import { PrismaClient } from '../../../prisma/generated'

let app: FastifyInstance
const prisma = new PrismaClient()

const FAKE_EMAIL = 'nicholas.crow@email.com'

const FAKE_BUSINESS_CARD_DATA = {
  name: 'Nicholas Crow',
  email: FAKE_EMAIL,
  role: 'developer',
  mobile: '123456789',
}

function getToken(): string {
  return app.createTestJwt({
    email: FAKE_EMAIL,
    name: 'Nicholas Crow',
    picture: 'https://test.com/nicholas.crow.jpg',
    company: 'it',
    role: 'ADMIN',
  })
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
  const response = await addBusinessCard(FAKE_BUSINESS_CARD_DATA)
  t.equal(response.statusCode, 204)

  const bc = await prisma.businessCard.findUnique({where: {email: FAKE_EMAIL}})
  t.equal(bc?.name, FAKE_BUSINESS_CARD_DATA.name)
})

test('should return 500 if user email is different from business card email', async (t) => {
  const response = await addBusinessCard({...FAKE_BUSINESS_CARD_DATA, email: 'another.email.com'})
  t.equal(response.statusCode, 500)
})

test('should update business card', async (t) => {
  let response = await addBusinessCard(FAKE_BUSINESS_CARD_DATA)
  t.equal(response.statusCode, 204)

  const bc = await prisma.businessCard.findUnique({where: {email: FAKE_EMAIL}})
  t.equal(bc?.name, FAKE_BUSINESS_CARD_DATA.name)

  const newName = 'Nicholas Crow 2'
  response = await addBusinessCard({...FAKE_BUSINESS_CARD_DATA, name: newName})
  t.equal(response.statusCode, 204)

  const updatedBc = await prisma.businessCard.findUnique({where: {email: FAKE_EMAIL}})
  t.equal(updatedBc?.name, newName)
})

async function addBusinessCard(payload: BusinessCardType) {
  return await app.inject({
    method: 'POST',
    url: '/api/business-card',
    headers: {
      authorization: `Bearer ${getToken()}`,
    },
    payload,
  })
}