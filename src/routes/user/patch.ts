import { FastifyInstance } from 'fastify'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { ForbiddenException } from '@src/shared/exceptions/ForbiddenException'
import {
  UserIdQueryString,
  UserIdQueryStringType,
} from '@src/core/User/service/dto/UserIdQueryString'
import {
  PatchUserProfile,
  PatchUserProfileType,
} from '@src/core/User/model/user.model'
import { BadRequestException } from '@src/shared/exceptions/BadRequestException'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.patch<{
    Params: UserIdQueryStringType
    Body: PatchUserProfileType
  }>(
    '/:id',
    {
      onRequest: [fastify.authenticate],
      casbin: {
        rest: {
          getObj: 'user',
          getAct: 'write',
        },
      },
      schema: {
        tags: ['Users'],
        params: UserIdQueryString,
        body: PatchUserProfile,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          204: { type: 'null', description: 'No Content' },
          400: {
            type: 'null',
            description: 'Bad Request',
          },
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
          .patch(request.user.role, request.params.id, request.body)
        return reply.code(204).send()
      } catch (error) {
        if (error instanceof BadRequestException) {
          return reply.code(400).send()
        }
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
