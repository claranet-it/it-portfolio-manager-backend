import { FastifyInstance } from 'fastify'
import {
  CnaReadParamType,
  CnaReadParam,
  TimeEntriesForCnaList,
  TimeEntriesForCnaListType,
} from '@src/core/TimeEntry/model/timeEntry.model'
import { UnauthorizedError } from '@src/core/customExceptions/UnauthorizedError'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: CnaReadParamType
    Reply: TimeEntriesForCnaListType | string
  }>(
    '/time-off-for-cna',
    {
      schema: {
        tags: ['Time entry'],
        querystring: CnaReadParam,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: TimeEntriesForCnaList,
          401: {
            type: 'null',
            description: 'Unauthorized',
          },
          403: {
            type: 'null',
            description: 'Invalid API Key',
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
          .resolve('timeEntryService')
          .findTimeOffForCna({
            company: request.query.company,
            year: request.query.year,
            month: request.query.month,
          })
      } catch (error) {
        request.log.error(error)
        let errorMessage = ''
        let errorCode = 500
        if (error instanceof UnauthorizedError) {
          errorMessage = error.message
          errorCode = 401
        }
        return reply
          .code(errorCode)
          .send(JSON.stringify({ message: errorMessage }))
      }
    },
  )
}
