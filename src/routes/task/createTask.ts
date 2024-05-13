import { FastifyInstance } from 'fastify'
import {
  TaskCreateParams,
  TaskCreateParamType,
} from '@src/core/Task/model/task.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post<{
    Body: TaskCreateParamType
  }>(
    '/task',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Task'],
        body: TaskCreateParams,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          204: {
            type: 'null',
            description: 'Task saved successfully',
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
          .resolve('taskService')
          .createTask(request.body)
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
