import { FastifyInstance } from 'fastify'
import {
  TaskCreateQueryParams,
  TaskCreateQueryParamsType,
} from '@src/core/Task/model/task.model'
import { InvalidCharacterError } from '@src/core/customExceptions/InvalidCharacterError'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post<{
    Body: TaskCreateQueryParamsType
  }>(
    '/task',
    {
      onRequest: [fastify.authenticate],
      casbin: {
        rest: {
          getObj: 'task',
          getAct: 'write',
        },
      },
      schema: {
        tags: ['Task'],
        body: TaskCreateQueryParams,
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
        await fastify
          .dependencyInjectionContainer()
          .resolve('taskService')
          .createTask({ ...request.body, company: request.user.company })
        return reply.send(JSON.stringify({ message: 'OK' }))
      } catch (error) {
        request.log.error(error)
        let errorCode = 500
        let errorMessage = ''
        if (error instanceof InvalidCharacterError) {
          errorCode = 400
          errorMessage = error.message
        }
        return reply
          .code(errorCode)
          .send(JSON.stringify({ message: errorMessage }))
      }
    },
  )
}
