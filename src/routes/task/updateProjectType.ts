import { FastifyInstance } from 'fastify'
import {
  ProjectTypeUpdateQueryParams,
  ProjectTypeUpdateQueryParamsType,
} from '@src/core/Task/model/task.model'
import { TaskError } from '@src/core/customExceptions/TaskError'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.put<{
    Body: ProjectTypeUpdateQueryParamsType
  }>(
    '/project-type',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Task'],
        body: ProjectTypeUpdateQueryParams,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          204: {
            type: 'null',
            description: 'Task updated successfully',
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
          .updateProjectType({ ...request.body, company: request.user.company })
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
