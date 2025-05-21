import { FastifyInstance } from 'fastify'
import { Type } from '@sinclair/typebox'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { ForbiddenException } from '@src/shared/exceptions/ForbiddenException'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Reply: {
      customers: { id: string, name: string }[],
      projects: { id: string, name: string }[],
      tasks: { id: string, name: string }[],
      efforts: { id: string, notes: string }[],
      timeEntries: { id: string, description: string }[] }
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
            tasks: Type.Array(
              Type.Object({
                id: Type.String(),
                name: Type.String(),
              }),
            ),
            customers: Type.Array(
              Type.Object({
                id: Type.String(),
                name: Type.String(),
              }),
            ),
            projects: Type.Array(
              Type.Object({
                id: Type.String(),
                name: Type.String(),
              }),
            ),
            timeEntries: Type.Array(
              Type.Object({
                id: Type.String(),
                description: Type.String(),
              }),
            ),
            efforts: Type.Array(
              Type.Object({
                id: Type.String(),
                notes: Type.String(),
              }),
            ),
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
