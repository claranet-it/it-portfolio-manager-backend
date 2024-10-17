import { FastifyInstance } from 'fastify'
import {
  ProductivityReportReadParam,
  ProductivityReportReadParamType,
  ProductivityReportResponse,
} from '@src/core/Report/model/productivity.model'
import { DateRangeError } from '@src/core/customExceptions/DateRangeError'
import { Type } from '@sinclair/typebox'
import { FieldsOrderError } from '@src/core/customExceptions/FieldsOrderError'
import { UnauthorizedError } from '@src/core/customExceptions/UnauthorizedError'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: ProductivityReportReadParamType
  }>(
    '/productivity-dashboard',
    {
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
        await fastify
          .dependencyInjectionContainer()
          .resolve('authService')
          .checkApiKey({
            apiKey: request.headers['x-api-key'],
          })

        return await fastify
          .dependencyInjectionContainer()
          .resolve('reportService')
          .getProductivityReport({
            company: 'it',
            from: request.query.from,
            to: request.query.to,
            customer: request.query.customer,
            project: request.query.project,
            task: request.query.task,
            name: request.query.name,
          })
      } catch (error) {
        request.log.error(error)
        let errorCode = 500
        let errorMessage = ''
        if (error instanceof UnauthorizedError) {
          errorMessage = error.message
          errorCode = 401
        } else if (
          error instanceof DateRangeError ||
          error instanceof FieldsOrderError
        ) {
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
