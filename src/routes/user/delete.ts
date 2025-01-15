import { FastifyInstance } from 'fastify'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { ForbiddenException } from '@src/shared/exceptions/ForbiddenException'
import {
  UserIdQueryString,
  UserIdQueryStringType,
} from '@src/core/User/service/dto/UserIdQueryString'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.delete<{
    Params: UserIdQueryStringType
  }>(
    '/:id',
    {
      onRequest: [fastify.authenticate],
      casbin: {
        rest: {
          getObj: 'user',
          getAct: 'delete',
        },
      },
      schema: {
        tags: ['Users'],
        params: UserIdQueryString,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          204: { type: 'null', description: 'No Content' },
          401: {
            type: 'null',
            description: 'Unauthorized',
          },
          403: {
            type: 'null',
            description: 'Forbidden',
          },
          404: {
            type: 'null',
            description: 'Not Found',
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
          .resolve('userProfileService')
          .delete(request.params.id)
        return reply.code(204).send()
      } catch (error) {
        if (error instanceof NotFoundException) {
          return reply.code(404).send()
        }
        if (error instanceof ForbiddenException) {
          return reply.code(403).send()
        }
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
