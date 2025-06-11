import { FastifyInstance } from 'fastify'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { ForbiddenException } from '@src/shared/exceptions/ForbiddenException'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.patch(
    '/to-be-encrypted',
    {
      onRequest: [fastify.authenticate],
      schema: {
        consumes: ['multipart/form-data'],
        tags: ['Encryption'],
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          204: {
            type: 'null',
            description: 'Company data encrypted successfully',
          },
          400: {
            type: 'null',
            description: 'Bad request',
          },
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
        const file = await request.file()
        if (!file) {
          return reply.code(400).send()
        }
        
        let body
        const buffer = await file.toBuffer()
        
        try {
          body = JSON.parse(buffer.toString()) // GetDataToEncryptReturnType
        } catch (e) {
          return reply.code(400).send()
        }

        return await fastify
          .dependencyInjectionContainer()
          .resolve('encryptionService')
          .encryptData(request.user, body)
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
