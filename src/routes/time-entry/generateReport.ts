import { FastifyInstance } from 'fastify'
import {
  TimeEntryRowList,
  TimeEntryReadParamWithCrewType,
  TimeEntryReadParamWithCrew,
  TimeEntryReportListType,
} from '@src/core/TimeEntry/model/timeEntry.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: TimeEntryReadParamWithCrewType
    Reply: TimeEntryReportListType
  }>(
    '/report',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Time entry'],
        querystring: TimeEntryReadParamWithCrew,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: TimeEntryRowList,
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
          .generateReport({ ...request.query, company: request.user.company })
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
