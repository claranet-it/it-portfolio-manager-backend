import { FastifyInstance } from 'fastify'
import {
  CnaUserProfileList,
  CnaUserProfileListType,
  CompleteUserProfileType,
} from '@src/core/User/model/user.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Reply: CnaUserProfileListType | string
  }>(
    '/list',
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
          200: CnaUserProfileList,
          401: {
            type: 'null',
            description: 'Unauthorized',
          },
          403: {
            type: 'null',
            description: 'Invalid API Key',
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
        const users = await fastify
          .dependencyInjectionContainer()
          .resolve('userProfileService')
          .getByCompany(request.user.company)
        return users.map((user: CompleteUserProfileType) => ({
          id: user.uid,
          email: user.uid,
          name: user.name,
        }))
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
