import { FastifyInstance } from 'fastify'
import {
  ProductivityReportReadParam,
  ProductivityReportReadParamType,
  ProductivityReportResponse,
} from '@src/core/Report/model/productivity.model'
import { DateRangeError } from '@src/core/customExceptions/DateRangeError'
import { Type } from '@sinclair/typebox'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: ProductivityReportReadParamType
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
          400: Type.Object({ message: Type.String() }),
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
        let errorCode = 500
        let errorMessage = ''
        if (error instanceof DateRangeError) {
          errorCode = 400
          errorMessage = error.message
          return reply.code(errorCode).send({ message: errorMessage })
        }
        return reply.code(errorCode).send()
      }
    },
  )
}
