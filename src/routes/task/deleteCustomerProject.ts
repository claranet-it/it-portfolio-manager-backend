import { FastifyInstance } from 'fastify'
import {
  CustomerProjectDeleteQueryParams,
  CustomerProjectDeleteQueryParamsType,
} from '@src/core/Task/model/task.model'
import { TaskError } from '@src/core/customExceptions/TaskError'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.delete<{
    Body: CustomerProjectDeleteQueryParamsType
  }>(
    '/customer-project',
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
        body: CustomerProjectDeleteQueryParams,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          204: {
            type: 'null',
            description: 'Customer updated successfully',
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
          .deleteCustomerProject({
            ...request.body,
            company: request.user.company,
          })
        return reply.send(JSON.stringify({ message: 'OK' }))
      } catch (error) {
        request.log.error(error)
        let errorCode = 500
        let errorMessage = ''
        if (error instanceof TaskError) {
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
