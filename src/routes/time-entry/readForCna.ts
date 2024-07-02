import { FastifyInstance } from 'fastify'
import {
  CnaReadParamType,
  CnaReadParam,
  TimeEntriesForCnaType,
  TimeEntriesForCna,
} from '@src/core/TimeEntry/model/timeEntry.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: CnaReadParamType
    Reply: TimeEntriesForCnaType
  }>(
    '/time-off-for-cna',
    {
      //onRequest: [fastify.authenticate],
      schema: {
        tags: ['Time entry'],
        querystring: CnaReadParam,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: TimeEntriesForCna,
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
          .findTimeOffForCna({
            company: request.query.company,
            year: request.query.year,
            month: request.query.month,
          })
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
