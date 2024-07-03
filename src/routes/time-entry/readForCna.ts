import { FastifyInstance } from 'fastify'
import {
  CnaReadParamType,
  CnaReadParam,
  TimeEntriesForCnaList,
  TimeEntriesForCnaListType,
} from '@src/core/TimeEntry/model/timeEntry.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: CnaReadParamType
    Reply: TimeEntriesForCnaListType
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
          200: TimeEntriesForCnaList,
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
            user: request.query.user,
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
