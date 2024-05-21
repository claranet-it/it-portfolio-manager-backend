import { FastifyInstance } from 'fastify'
import {
  DeleteTimeEntryRowType,
  DeleteTimeEntryRow,
} from '@src/core/TimeEntry/model/timeEntry.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.delete<{
    Body: DeleteTimeEntryRowType
  }>(
    '/mine',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Time entry'],
        body: DeleteTimeEntryRow,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: {
            type: 'null',
            description: 'succesfully deleted',
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
          .resolve('timeEntryService')
          .delete({
            user: request.user.email,
            ...request.body,
          })
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
