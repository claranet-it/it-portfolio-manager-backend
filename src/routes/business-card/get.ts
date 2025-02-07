import { FastifyInstance } from 'fastify'
import {
  BusinessCard,
  GetBusinessCard,
  GetBusinessCardType,
} from '@src/core/BusinessCard/model'
import { BadRequestException } from '@src/shared/exceptions/BadRequestException'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Params: GetBusinessCardType
  }>(
    '/:email',
    {
      schema: {
        tags: ['Business card'],
        params: GetBusinessCard,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: BusinessCard,
          400: {
            type: 'null',
            description: 'bad request',
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
        const { email } = request.params as { email: string }
        return await fastify
          .dependencyInjectionContainer()
          .resolve('businessCardService')
          .get({
            email,
          })
      } catch (error) {
        request.log.error(error)
        if (error instanceof BadRequestException) {
          return reply.code(400).send()
        }
        return reply.code(500).send()
      }
    },
  )
}
