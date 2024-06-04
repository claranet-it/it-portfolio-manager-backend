import { FastifyInstance } from 'fastify'
import {
  NetworkingEffortResponse,
  NetworkingEffortResponseType,
} from '@src/core/Networking/model/networking.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Reply: NetworkingEffortResponseType
  }>(
    '/effort',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Other Companies Effort'],
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: NetworkingEffortResponse,
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
          .getNetworkingAverageEffortOf(request.user.company)
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
