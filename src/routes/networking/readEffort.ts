import { FastifyInstance } from 'fastify'
import {
  NetworkingEffortResponse,
  NetworkingEffortResponseType,
} from '@src/core/Networking/model/networking.model'
import {
  EffortQueryParams,
  EffortQueryParamsType,
} from '@src/core/Effort/model/effort'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: EffortQueryParamsType
    Reply: NetworkingEffortResponseType
  }>(
    '/effort/next',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Networking Effort'],
        querystring: EffortQueryParams,
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
          .getNetworkingAverageEffortOf({
            ...request.query,
            company: request.user.company,
          })
      } catch (error) {
        console.log(error)
        return reply.code(500).send()
      }
    },
  )
}
