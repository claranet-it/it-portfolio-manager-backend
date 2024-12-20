import { FastifyInstance } from 'fastify'
import {
  CompaniesArray,
  CompaniesArrayType,
} from '@src/core/Company/model/Company'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Reply: CompaniesArrayType
  }>(
    '/mine',
    {
      onRequest: [fastify.authenticate],
      casbin: {
        rest: {
          getObj: 'companyConnections',
          getAct: 'read',
        },
      },
      schema: {
        tags: ['CompanyConnections'],
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: CompaniesArray,
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
          .resolve('companyConnectionsService')
          .getMine(request.user)
      } catch (error) {
        console.error(error)
        return reply.code(500).send()
      }
    },
  )
}
