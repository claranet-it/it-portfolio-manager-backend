import { FastifyInstance } from 'fastify'
import {
  TaskQueryParam,
  TaskQueryParamType,
} from '@src/core/Task/model/task.model'
import { InvalidCharacterError } from '@src/core/customExceptions/InvalidCharacterError'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post<{
    Body: TaskQueryParamType
  }>(
    '/task',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Task'],
        body: TaskQueryParam,
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
          .createTask({ ...request.body, company: request.user.company })
      } catch (error) {
        request.log.error(error)
        let errorCode = 500
        let errorMessage = ''
        if (error instanceof InvalidCharacterError) {
          errorCode = 400
          errorMessage = error.message
        }
        return reply.code(errorCode).send(errorMessage)
      }
    },
  )
}
