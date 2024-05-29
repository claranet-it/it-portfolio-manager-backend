import { FastifyInstance } from 'fastify'
import {
  CustomerList,
  CustomerListType,
} from '@src/core/Task/model/task.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Reply: CustomerListType
  }>(
    '/customer',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Task', 'Customer'],
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: CustomerList,
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
          .resolve('taskService')
          .getCustomers(request.user.company)
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
