import { FastifyInstance } from 'fastify'
import {
  Company,
  CompanyType,
} from '@src/core/Company/model/Company'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Reply: CompanyType
  }>(
    '/mine',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Company'],
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: Company,
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
          .resolve('companyService')
          .getMine(request.user)
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
