import { FastifyInstance } from 'fastify'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { ForbiddenException } from '@src/shared/exceptions/ForbiddenException'
import {
  SkillIdQueryString,
  SkillIdQueryStringType,
} from '@src/core/Skill/service/dto/SkillIdQueryString'
import {
  SkillPatchBody,
  SkillPatchBodyType,
} from '@src/core/Skill/service/dto/SkillPatchBody'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.patch<{
    Params: SkillIdQueryStringType
    Body: SkillPatchBodyType
  }>(
    '/:id',
    {
      onRequest: [fastify.authenticate],
      casbin: {
        rest: {
          getObj: 'skill',
          getAct: 'write',
        },
      },
      schema: {
        tags: ['Skill'],
        params: SkillIdQueryString,
        body: SkillPatchBody,
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
        return await fastify
          .dependencyInjectionContainer()
          .resolve('skillService')
          .patch(request.user, request.params.id, request.body)
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
