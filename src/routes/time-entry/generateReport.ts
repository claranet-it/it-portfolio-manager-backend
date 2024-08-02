import { FastifyInstance } from 'fastify'
import {
  TimeEntryReadParamWithCrewType,
  TimeEntryReadParamWithCrew,
  TimeEntryReportListType,
  TimeEntryReportList,
} from '@src/core/TimeEntry/model/timeEntry.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: TimeEntryReadParamWithCrewType
    Reply: TimeEntryReportListType | string
  }>(
    '/time-report',
    {
      //onRequest: [fastify.authenticate],
      schema: {
        tags: ['Time entry'],
        querystring: TimeEntryReadParamWithCrew,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: TimeEntryReportList,
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
          .generateReport({ ...request.query, company: 'it' })
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
