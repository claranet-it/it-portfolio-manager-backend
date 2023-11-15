import { FastifyInstance } from 'fastify'
import { UserWithProfile, UserWithProfileType } from '@models/user.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Reply: UserWithProfileType }>(
    '/me',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Users'],
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: UserWithProfile,
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
        return await fastify
          .dependencyInjectionContainer()
          .resolve('userService')
          .getUser(request.user)
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
