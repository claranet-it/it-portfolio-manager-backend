import { FastifyInstance } from 'fastify'
import {
  NetworkingSkillsResponse,
  NetworkingSkillsResponseType,
} from '@src/core/Networking/model/networking.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Reply: NetworkingSkillsResponseType
  }>(
    '/skills',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Other Companies Skills'],
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: NetworkingSkillsResponse,
          400: {
            type: 'null',
            description: 'Bad request',
          },
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
          .resolve('networkingService')
          .getNetworkingAverageSkillsOf(request.user.company)
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
