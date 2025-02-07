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
      request.session.state = randomBytes(32).toString('hex')
      request.session.referer = request.headers.referer ?? ''

      const redirectUrl = await fastify
        .dependencyInjectionContainer()
        .resolve('msalService')
        .generateRedirectUrl()

      reply.redirect(redirectUrl)
    },
  )
}
