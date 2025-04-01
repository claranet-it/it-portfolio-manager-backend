import { FastifyInstance } from 'fastify'
import {
  TimeEntryReportList,
} from '@src/core/TimeEntry/model/timeEntry.model'
import { ReportProjectsType, ReportProjects } from '@src/core/Report/model/projects.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post<{
    Body: ReportProjectsType
  }>(
    '/projects',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Time entry'],
        body: ReportProjects,
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
          .getReportProjectsFilterBy({ ...request.body, company: request.user.company })
      } catch (error) {
        console.error(error)
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
