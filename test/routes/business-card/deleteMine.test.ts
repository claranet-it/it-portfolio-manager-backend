import { FastifyInstance } from 'fastify'
import { test, before, after } from 'tap'
import createApp from '@src/app'
import { PrismaClient } from '../../../prisma/generated'
import { addBusinessCard, deleteOwnBusinessCard } from '@test/utils/business-card'
import { getToken } from '@test/utils/token'

let app: FastifyInstance
const prisma = new PrismaClient()

const FAKE_EMAIL = 'TEST_DELETEMINE@email.com'

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

test('should return 401 deleting business card without authentication', async (t) => {
  const response = await app.inject({
    method: 'DELETE',
    url: '/api/business-card',
  })
  t.equal(response.statusCode, 401)
})

test('should return 500 deleting non existing business card', async (t) => {
  const response = await deleteOwnBusinessCard(app, getToken(app, FAKE_EMAIL))
  t.equal(response.statusCode, 500)
})

test('should delete business card', async (t) => {
  const response = await addBusinessCard(app, getToken(app, FAKE_EMAIL), FAKE_BUSINESS_CARD_DATA)
  t.equal(response.statusCode, 204)

  const bc = await prisma.businessCard.findUnique({where: {email: FAKE_EMAIL}})
  t.equal(bc?.name, FAKE_BUSINESS_CARD_DATA.name)

  const deleteResponse = await deleteOwnBusinessCard(app, getToken(app, FAKE_EMAIL))
  t.equal(deleteResponse.statusCode, 204)
    
  const deletedBc = await prisma.businessCard.findUnique({ where: { email: FAKE_EMAIL } })
  t.equal(deletedBc, null)
})
