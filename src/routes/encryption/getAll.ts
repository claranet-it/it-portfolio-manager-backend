import { FastifyInstance } from 'fastify'
import { Type } from '@sinclair/typebox'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { ForbiddenException } from '@src/shared/exceptions/ForbiddenException'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Reply: { customers: any[], projects: any[], tasks: any[], efforts: any[], timeEntries: any[] }
  }>(
    '/to-be-encrypted',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Encryption'],
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: Type.Object({
            customers: Type.Array(Type.Any()),
            projects: Type.Array(Type.Any()),
            tasks: Type.Array(Type.Any()),
            efforts: Type.Array(Type.Any()),
            timeEntries: Type.Array(Type.Any()),
          }),
          401: {
            type: 'null',
            description: 'Unauthorized',
          },
          404: {
            type: 'null',
            description: 'Company Not Found',
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
          .resolve('encryptionService')
          .getDataToEncrypt(request.user)
      } catch (error) {
        request.log.error(error)
        if (error instanceof NotFoundException) {
          return reply.code(404).send()
        }
        if (error instanceof ForbiddenException) {
          return reply.code(403).send()
        }
        return reply.code(500).send()
      }
    },
  )
}
