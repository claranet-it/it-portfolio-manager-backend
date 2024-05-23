import { FastifyInstance } from 'fastify'
import {} from '@src/core/User/model/user.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post<{
    Body: { token: string }
    Reply: { token: string }
  }>(
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
      fastify.dependencyInjectionContainer()
      .resolve('authService')
      .verifyJwt('Claranet', request.body.token)
      reply.code(200).send()
    },
  )
}
