import { FastifyInstance } from 'fastify'
import {
  ProjectList,
  ProjectListType,
  ProjectQueryParam,
  ProjectQueryParamType,
} from '@src/core/Task/model/task.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: ProjectQueryParamType
    Reply: ProjectListType
  }>(
    '/project',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Task', 'Project'],
        querystring: ProjectQueryParam,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: ProjectList,
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
          .resolve('taskService')
          .getProjects({ ...request.query, company: request.user.company })
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
