import { FastifyInstance } from 'fastify'
import {
  BackgroundTemplateList,
} from '@src/core/BackgroundTemplate/model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Background'],
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: BackgroundTemplateList,
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
          .resolve('backgroundTemplateService')
          .getAll()
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
