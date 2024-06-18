import { afterEach, beforeEach, test } from 'tap'
import createApp from '@src/app'
import { ConfigurationType } from '@src/core/Configuration/model/configuration.model'
import { FastifyInstance } from 'fastify'

let app: FastifyInstance

beforeEach(async () => {
  app = createApp({ logger: false })
  await app.ready()
})

afterEach(async () => {
  await app.close()
})

test('get all configuration', async (t) => {
  const token = app.createTestJwt({
    email: 'tester@claranet',
    name: 'Tester',
    picture: 'https://test.com/test.jpg',
    company: 'it',
  })

  const response = await app.inject({
    method: 'GET',
    url: '/api/configuration',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  const configuration = response.json<ConfigurationType>()

  t.equal(response.statusCode, 200)

  // check if the configuration object has keys crews, skills and scoreRange
  t.equal(Object.keys(configuration).length, 4)
  t.equal(Object.keys(configuration).includes('crews'), true)
  t.equal(Object.keys(configuration).includes('skills'), true)
  t.equal(Object.keys(configuration).includes('scoreRange'), true)
  t.equal(Object.keys(configuration).includes('scoreRangeLabels'), true)
  t.equal(configuration.crews.length, 6)
  t.equal(configuration.skills.Developer.length, 13)
  t.equal(configuration.skills.Cloud.length, 15)
  t.equal(configuration.scoreRange.min, 0)
  t.equal(configuration.scoreRange.max, 3)
  t.equal(Object.keys(configuration.scoreRangeLabels).length, 4)
})

test('get all configuration without authentication', async (t) => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/configuration',
  })

  t.equal(response.statusCode, 401)
})

const inputs = [
  {
    company: 'it',
    expectedCrews: [
      {
        name: 'Moon',
        service_line: 'Developer',
      },
      {
        name: 'Cloud',
        service_line: 'Cloud',
      },
      {
        name: 'Bees',
        service_line: 'Developer',
      },
      {
        name: 'Polaris',
        service_line: 'Developer',
      },
      {
        name: 'Rohan',
        service_line: 'Developer',
      },
      {
        name: 'Hydra',
        service_line: 'Cloud',
      },
    ].sort((a, b) => a.name.localeCompare(b.name)),
  },
  {
    company: 'fr',
    expectedCrews: [
      {
        name: 'France - Beta Test',
        service_line: 'Developer',
      },
    ],
  },
]

inputs.forEach((input) => {
  test(`get companies for company ${input.company}`, async (t) => {
    const token = app.createTestJwt({
      email: 'tester@claranet',
      name: 'Tester',
      picture: 'https://test.com/test.jpg',
      company: input.company,
    })

    const response = await app.inject({
      method: 'GET',
      url: '/api/configuration',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    const configuration = response.json<ConfigurationType>()

    t.equal(response.statusCode, 200)

    t.same(configuration.crews, input.expectedCrews)
})

test('get all configuration without authentication', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    const response = await app.inject({
        method: 'GET',
        url: '/api/configuration',
    })

    t.equal(response.statusCode, 401)
  })
})
