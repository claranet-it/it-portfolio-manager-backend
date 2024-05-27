import { FastifyInstance } from 'fastify'
import { UnauthorizedError } from '@src/core/customExceptions/UnauthorizedError'
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
      try {
        const jwt = await fastify
          .dependencyInjectionContainer()
          .resolve('authService')
          .signIn(request.body)
        reply.send({ token: jwt })
      } catch (error) {
        request.log.error(error)
        let errorMessage = ''
        let errorCode = 500
        if (error instanceof UnauthorizedError) {
          errorMessage = error.message
          errorCode = 401
        }
        reply.code(errorCode).send(errorMessage)
      }
    },
  )
}
