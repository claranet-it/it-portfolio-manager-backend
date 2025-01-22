import { FastifyInstance } from 'fastify'
import { DeleteBusinessCard, DeleteBusinessCardType } from '@src/core/BusinessCard/model'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { ForbiddenException } from '@src/shared/exceptions/ForbiddenException'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.delete<{
    Body: DeleteBusinessCardType
  }>(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Business card'],
        body: DeleteBusinessCard,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          204: {
            type: 'null',
            description: 'Business card deleted successfully',
          },
          400: {
            type: 'null',
            description: 'bad request',
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
          .resolve('businessCardService')
          .delete({
            userEmail: request.user.email,
            ...request.body
          })
        reply.code(204).send()
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
