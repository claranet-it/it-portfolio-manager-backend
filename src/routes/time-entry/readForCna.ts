import { FastifyInstance } from 'fastify'
import {
    CnaReadParamType, CnaReadParam, TimeEntryRowListWithProjectType, TimeEntryRowWithProjectList,
} from '@src/core/TimeEntry/model/timeEntry.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: CnaReadParamType
    Reply: TimeEntryRowListWithProjectType
  }>(
      '/cna',
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
            200: TimeEntryRowWithProjectList,
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
              .findForCna({
                users: request.query.users,
                year: request.query.year,
                month: request.query.month,
                company: request.query.company
              })
        } catch (error) {
          request.log.error(error)
          return reply.code(500).send()
        }
      },
  )

}