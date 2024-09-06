import { FastifyInstance } from 'fastify'
import {
  TaskReadQueryParamsType,
  TaskStructureList,
  TaskStructureListType,
} from '@src/core/Task/model/task.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: TaskReadQueryParamsType
    Reply: TaskStructureListType
  }>(
    '/task-list',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Task'],
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: TaskStructureList,
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
          .getTaskStructure(request.user.company)
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
