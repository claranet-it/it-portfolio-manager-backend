import { FastifyInstance } from 'fastify'
import { CompanyIdQueryString, CompanyIdQueryStringType } from '@src/core/Company/service/dto/CompanyIdQueryString'
import { CompanyPatchBody, CompanyPatchBodyType } from '@src/core/Company/service/dto/CompanyPatchBody'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { ForbiddenException } from '@src/shared/exceptions/ForbiddenException'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.patch<{
    Params: CompanyIdQueryStringType
    Body: CompanyPatchBodyType
  }>(
    '/:id',
    {
      onRequest: [fastify.authenticate],
      casbin: {
        rest: {
          getObj: 'company',
          getAct: 'write',
        },
      },
      schema: {
        tags: ['Company'],
        params: CompanyIdQueryString,
        body: CompanyPatchBody,
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
          .resolve('companyService')
          .patch(request.user, request.params.id, request.body)
      } catch (error) {
        if(error instanceof NotFoundException) {
          return reply.code(404).send()
        }
        if(error instanceof ForbiddenException) {
          return reply.code(403).send()
        }
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
