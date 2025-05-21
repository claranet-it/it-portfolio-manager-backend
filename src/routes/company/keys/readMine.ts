import { FastifyInstance } from 'fastify'
import { Type } from '@sinclair/typebox'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { ForbiddenException } from '@src/shared/exceptions/ForbiddenException'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Reply: { privateKey: string, symmetricKey: string, encryptionCompleted: boolean }
  }>(
    '/',
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
          200: Type.Object({
            encryptedPrivateKey: Type.String(),
            encryptedAESKey: Type.String(),
            encryptionCompleted: Type.Boolean(),
          }),
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
          .getKeys(request.user)
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
