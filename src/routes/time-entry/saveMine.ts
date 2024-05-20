import { FastifyInstance } from 'fastify'
import {
  InsertTimeEntryRowType,
  InsertTimeEntryRow,
} from '@src/core/TimeEntry/model/timeEntry.model'
import { TaskNotExistsError } from '@src/core/customExceptions/TaskNotExistsError'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post<{
    Body: InsertTimeEntryRowType
  }>(
    '/mine',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Time entry'],
        body: InsertTimeEntryRow,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          204: {
            type: 'null',
            description: 'Time entry inserted successfully',
          },
          400: {
            type: 'null',
            description: 'bad request',
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
          .resolve('timeEntryService')
          .saveMine(
            {
              user: request.user.email,
              ...request.body,
            },
            request.user.company,
          )
        reply.code(204).send()
      } catch (error) {
        request.log.error(error)
        let errorCode = 500
        let errorMessage = ''
        if (error instanceof TaskNotExistsError) {
          errorCode = 400
          errorMessage = error.message
        }

        return reply.code(errorCode).send(errorMessage)
      }
    },
  )
}
