import { FastifyInstance } from 'fastify'
import { BusinessCard, BusinessCardType } from '@src/core/BusinessCard/model'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { ForbiddenException } from '@src/shared/exceptions/ForbiddenException'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post<{
    Body: BusinessCardType
  }>(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Business card'],
        body: BusinessCard,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          201: {
            type: 'null',
            description: 'Business card inserted successfully',
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
          .save({
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
