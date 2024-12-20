import { FastifyInstance } from 'fastify'
import {
  CompaniesArray,
  CompaniesArrayType,
} from '@src/core/Company/model/Company'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Reply: CompaniesArrayType
  }>(
    '/networking/available',
    {
      onRequest: [fastify.authenticate],
      casbin: {
        rest: {
          getObj: 'company',
          getAct: 'write',
        },
      },
      schema: {
        tags: ['Company'],
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
          404: {
            type: 'null',
            description: 'Not Found',
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
          .networkingFindAll(request.user)
      } catch (error) {
        if (error instanceof NotFoundException) {
          return reply.code(404).send()
        }

        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
