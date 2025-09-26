import { FastifyInstance } from 'fastify'
import { CompaniesWithConnectionStatusArrayType } from '@src/core/Company/model/Company'
import { Type } from '@sinclair/typebox'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: { excludeMine?: boolean }
    Reply: CompaniesWithConnectionStatusArrayType
  }>(
    '/',
    {
      onRequest: [fastify.authenticate],
      casbin: {
        rest: {
          getObj: 'company',
          getAct: 'read',
        },
      },
      schema: {
        tags: ['Company'],
        security: [
          {
            apiKey: [],
          },
        ],
        querystring: {
          excludeMine: Type.Optional(Type.Boolean()),
        },
        response: {
          200: CompaniesWithConnectionStatusArrayType,
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
          .getAll(request.user, request.query.excludeMine)
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
