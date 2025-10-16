import { FastifyInstance } from 'fastify'
import {
  CnaReadParamType,
  CnaReadParam,
  TimeEntriesForCnaList,
  TimeEntriesForCnaListType,
} from '@src/core/TimeEntry/model/timeEntry.model'
import { UnauthorizedError } from '@src/core/customExceptions/UnauthorizedError'
import { ProjectOverSeventyList } from '@src/core/Report/model/projects.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: {company: string}
  }>(
    '/projects-over',
    {
      schema: {
        tags: ['Report'],
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: ProjectOverSeventyList,
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
          .resolve('reportService')
          .sendReportProjectOverSeventy(request.query.company)
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
