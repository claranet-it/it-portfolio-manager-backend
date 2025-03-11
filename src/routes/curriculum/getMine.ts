import { FastifyInstance } from 'fastify'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { ForbiddenException } from '@src/shared/exceptions/ForbiddenException'
import { Curriculum } from '@src/core/Curriculum/model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Curriculum'],
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: Curriculum,
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
          .resolve('curriculumService')
          .get({
            email: request.user.email,
          })
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
