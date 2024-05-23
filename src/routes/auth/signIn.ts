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
     const jwt =  await fastify.dependencyInjectionContainer()
      .resolve('authService')
      .signIn(request.body)
      reply.send({token: jwt})
    },
  )
}
