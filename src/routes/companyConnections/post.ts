import { FastifyInstance } from 'fastify'
import { BadRequestException } from '@src/shared/exceptions/BadRequestException'
import {
  CompanyConnectionsPostBody,
  CompanyConnectionsPostBodyType,
} from '@src/core/CompanyConnections/service/dto/CompanyConnectionsPostBody'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post<{
    Body: CompanyConnectionsPostBodyType
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
        body: CompanyConnectionsPostBody,
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
          .create(request.body)
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
