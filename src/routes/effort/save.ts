import { FastifyInstance } from 'fastify'
import {
  EffortRow,
  EffortRowType,
} from '@src/core/Effort/model/effort'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.put<{
    Body: EffortRowType
  }>(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Effort'],
        body: EffortRow,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          204: {
            type: 'null',
            description: 'Effort saved successfully',
          },
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
          .saveEffort(request.body)
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
