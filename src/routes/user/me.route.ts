import { FastifyInstance } from 'fastify'
import { User, UserType } from '@models/user.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Reply: UserType }>(
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
          200: User,
          401: {
            type: 'null',
            description: 'Unauthorized',
          },
        },
      },
    },
    async (request, reply) => {
      try {
        return fastify.getCurrentUser(request.user)
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
