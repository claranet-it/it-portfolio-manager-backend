import { FastifyInstance } from 'fastify'
import {
  ProjectReadParams,
  ProjectReadParamsType,
  ProjectRow,
  ProjectRowType,
  Projects,
  ProjectsType,
} from '@src/core/Task/model/task.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: ProjectReadParamsType
    Reply: ProjectsType
  }>(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Project'],
        querystring: ProjectReadParams,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: Projects,
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
          .resolve('projectService')
          .get(request.query)
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
  fastify.get<{
    Params: { uid: string }
    Reply: ProjectRowType
  }>(
    '/:uid',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Project'],
        params: {
          type: 'object',
          properties: {
            uid: {
              type: 'string',
            },
          },
          required: ['uid'],
        },
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: ProjectRow,
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
          .resolve('projectService')
          .getByUid(request.params.uid)
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
