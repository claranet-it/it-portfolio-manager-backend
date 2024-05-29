import { FastifyInstance } from 'fastify'
import {
  Configuration,
  ConfigurationType,
} from '@src/core/Configuration/model/configuration.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Reply: ConfigurationType }>(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Configuration'],
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: Configuration,
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
        return fastify
          .dependencyInjectionContainer()
          .resolve('configurationService')
          .getAllConfiguration(request.user.company)
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
