import { FastifyInstance } from 'fastify'
import {
  TimeEntryRowListType,
  InsertTimeEntryRowType,
  InsertTimeEntryRow,
} from '@src/core/TimeEntry/model/timeEntry.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post<{
    Body: InsertTimeEntryRowType
    Reply: TimeEntryRowListType
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
          .saveMine({
            user: request.user.email,
            ...request.body,
          })
        reply.code(204).send()
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
