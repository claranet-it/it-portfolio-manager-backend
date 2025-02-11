import { FastifyInstance } from 'fastify'
import { randomBytes } from 'crypto'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get(
    '/',
    {
      schema: {
        tags: ['Auth'],
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          401: {
            type: 'null',
            description: 'Unauthorized',
          },
          500: {
            type: 'null',
            description: 'Internal server error',
          },
        },
      },
    },
    async (request, reply) => {
      const state = randomBytes(32).toString('hex')
      request.session.state = state
      request.session.referer = request.headers.referer ?? ''

      const redirectUrl = await fastify
        .dependencyInjectionContainer()
        .resolve('msalService')
        .generateRedirectUrl(state)

      reply.redirect(redirectUrl)
    },
  )
}
