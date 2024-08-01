import { test, beforeEach, afterEach } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'

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
    expectProjects: [{name: 'Assenze', type: 'absence'},{name: 'Funzionale', type: 'non-billable'},{name: 'Slack time', type: 'slack-time'}]
  },
  {
    company: 'it',
    customer: 'test customer',
    expectProjects: [{name: 'SOR Sviluppo', type: 'billable'}],
  },
  {
    company: "other company",
    customer: 'test customer of other company',
    expectProjects: [{name:'test project of other company', type: 'billable'}],
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
    console.log(JSON.stringify(response, null, 2))
    // const projects = response.json<ProjectListType>()
    // t.equal(projects.length, input.expectProjects.length)
    //
    // t.same(projects, input.expectProjects)
  })
})
