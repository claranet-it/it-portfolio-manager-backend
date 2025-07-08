import { FastifyInstance } from 'fastify'
import {
  TaskReadQueryParamsType, TaskStructure,
  TaskStructureType,
} from '@src/core/Task/model/task.model'
import { Type } from '@sinclair/typebox'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: TaskReadQueryParamsType
    Reply: TaskStructureType[]
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
          200: Type.Array(TaskStructure),
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
