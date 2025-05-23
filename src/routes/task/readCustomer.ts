import { FastifyInstance } from 'fastify'
import {
  Customer,
  CustomerQueryParamType,
  CustomerType,
} from '@src/core/Task/model/task.model'
import { Type } from '@sinclair/typebox'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: CustomerQueryParamType
    Reply: CustomerType[]
  }>(
    '/customer',
    {
      childLoggerFactory: undefined,
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Task', 'Customer'],
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: Type.Array(Customer),
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
      }
    },
    async (request, reply) => {
      try {
        return await fastify
          .dependencyInjectionContainer()
          .resolve('taskService')
          .getCustomers({company: request.user.company, completed: request.query.completed})
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
