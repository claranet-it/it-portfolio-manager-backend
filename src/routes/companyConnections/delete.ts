import { FastifyInstance } from 'fastify'
import { BadRequestException } from '@src/shared/exceptions/BadRequestException'
import {
  CompanyConnectionsDeleteBody,
  CompanyConnectionsDeleteBodyType,
} from '@src/core/CompanyConnections/service/dto/CompanyConnectionsDeleteBody'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.delete<{
    Body: CompanyConnectionsDeleteBodyType
  }>(
    '/',
    {
      onRequest: [fastify.authenticate],
      casbin: {
        rest: {
          getObj: 'companyConnections',
          getAct: 'write',
        },
      },
      schema: {
        tags: ['CompanyConnections'],
        body: CompanyConnectionsDeleteBody,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          204: {
            type: 'null',
            description: 'No content',
          },
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
        await fastify
          .dependencyInjectionContainer()
          .resolve('companyConnectionsService')
          .delete(request.body)
        return reply.code(204).send()
      } catch (error) {
        if (error instanceof BadRequestException) {
          return reply.code(400).send()
        }
        return reply.code(500).send()
      }
    },
  )
}
