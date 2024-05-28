import { FastifyInstance } from 'fastify'
import {
  EffortQueryParamsType,
  EffortReadParams,
  EffortResponse,
  EffortResponseType,
} from '@src/core/Effort/model/effort'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: EffortQueryParamsType
    Reply: EffortResponseType
  }>(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Effort'],
        querystring: EffortReadParams,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: EffortResponse,
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
          .resolve('effortService')
          .getEffortFormattedResponse({...request.query, company: request.user.company})
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
