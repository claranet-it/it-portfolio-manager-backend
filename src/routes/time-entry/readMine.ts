import { FastifyInstance } from 'fastify'
import {
  TimeEntryReadParamType,
  TimeEntryReadParam,
  TimeEntryRowWithProjectEntityListType,
  TimeEntryRowWithProjectEntityList,
} from '@src/core/TimeEntry/model/timeEntry.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: TimeEntryReadParamType
    Reply: TimeEntryRowWithProjectEntityListType
  }>(
    '/mine',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Time entry'],
        querystring: TimeEntryReadParam,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: TimeEntryRowWithProjectEntityList,
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
          .find({
            user: request.user.email,
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
