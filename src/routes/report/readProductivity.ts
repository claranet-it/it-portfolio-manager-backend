import { FastifyInstance } from 'fastify'
import {
  ProductivityReportReadParam,
  ProductivityReportReadParamType,
  ProductivityReportResponse,
  ProductivityReportResponseType,
} from '@src/core/Report/model/productivity.model'
import {
  TimeEntryReadParam,
  TimeEntryReadParamType,
} from '@src/core/TimeEntry/model/timeEntry.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: ProductivityReportReadParamType
    Reply: ProductivityReportResponseType
  }>(
    '/productivity',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Report'],
        querystring: ProductivityReportReadParam,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: ProductivityReportResponse,
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
          .resolve('reportService')
          .getProductivityReport({
            company: request.user.company,
            from: request.query.from,
            to: request.query.to,
          })
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
