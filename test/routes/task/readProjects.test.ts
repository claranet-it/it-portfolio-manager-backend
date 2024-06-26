import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { ProjectListType } from '@src/core/Task/model/task.model'

let app: FastifyInstance

beforeEach(async () => {
  app = createApp({ logger: false })
  await app.ready()
})

afterEach(async () => {
  await app.close()
})

test('read projects without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/task/project',
  })

  t.equal(response.statusCode, 401)
})

const inputs = [
  {
    company: 'it',
    customer: 'Claranet',
    expectProjects: ['Funzionale', 'Slack time'],
  },
  {
    company: 'it',
    customer: 'test customer',
    expectProjects: ['SOR Sviluppo'],
  },
  {
    company: "other company",
    customer: 'test customer of other company',
    expectProjects: ['test project of other company'],
  },
]

inputs.forEach((input) => {
  test(`read projects with company ${input.company} and customer ${input.customer} param`, async (t) => {
    const token = app.createTestJwt({
      email: 'nicholas.crow@email.com',
      name: 'Nicholas Crow',
      picture: 'https://test.com/nicholas.crow.jpg',
      company: input.company,
    })

    const response = await app.inject({
      method: 'GET',
      url: `/api/task/project/?customer=${input.customer}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    t.equal(response.statusCode, 200)

    const projects = response.json<ProjectListType>()
    t.equal(projects.length, input.expectProjects.length)


    t.same(projects, input.expectProjects)
  })
})
