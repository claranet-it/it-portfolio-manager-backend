import { FastifyInstance } from 'fastify'
import {
  TaskList,
  TaskListType,
  TaskReadParamType,
  TaskReadParams,
} from '@src/core/Task/model/task.model'

export default async function (fastify: FastifyInstance): Promise<void> { 
  fastify.get<{
    Querystring: TaskReadParamType
    Reply: TaskListType
  }>(
    '/task',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Task'],
        querystring: TaskReadParams,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: TaskList,
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
          .getTasks(request.query)
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
