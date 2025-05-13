import { FastifyInstance } from 'fastify'
import { BusinessCard, BusinessCardType } from '@src/core/BusinessCard/model'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { ForbiddenException } from '@src/shared/exceptions/ForbiddenException'
import { CompanyKeysType } from '@src/core/Company/model/CompanyKeys'
import { Type } from '@sinclair/typebox'
import { BadRequestException } from '@src/shared/exceptions/BadRequestException'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post<{
    Body: CompanyKeysType
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
          204: {
            type: 'null',
            description: 'Company keys created successfully',
          },
          400: {
            type: 'null',
            description: 'bad request',
          },
          401: {
            type: 'null',
            description: 'Unauthorized',
          },
          404: {
            type: 'null',
            description: 'Company not found',
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
          .resolve('companyService')
          .saveKeys({
            userEmail: request.user,
            ...request.body,
          })
        reply.code(201).send()
      } catch (error) {
        request.log.error(error)
        if (error instanceof NotFoundException) {
          return reply.code(404).send(error.message)
        }
        if (error instanceof ForbiddenException) {
          return reply.code(403).send()
        }
        if (error instanceof BadRequestException) {
          return reply.code(400).send(error.message)
        }
        return reply.code(500).send()
      }
    },
  )
}
