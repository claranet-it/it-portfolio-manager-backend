import { FastifyInstance } from 'fastify'
import {} from '@src/core/User/model/user.model'
import { verifyJwtParams, verifyJwtParamsType } from '@src/core/Auth/model/Auth.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post<{
    Body: verifyJwtParamsType
  }>(
    '/',
    {
      schema: {
        tags: ['Auth'],
        body: verifyJwtParams,
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
      .verifyJwt(request.body)
      reply.code(200).send()
    },
  )
}
