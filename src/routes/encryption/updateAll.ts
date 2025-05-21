import { FastifyInstance } from 'fastify'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { ForbiddenException } from '@src/shared/exceptions/ForbiddenException'
import {
  CustomerToEncryptReturnType, EffortToEncryptReturnType,
  ProjectToEncryptReturnType,
  TaskToEncryptReturnType, TimeEntryToEncryptReturnType,
} from '@src/core/Encryption/model/dataToEncrypt'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.patch<{
    Body: {
      customers: CustomerToEncryptReturnType[],
      projects: ProjectToEncryptReturnType[],
      tasks: TaskToEncryptReturnType[],
      efforts: EffortToEncryptReturnType[],
      timeEntries: TimeEntryToEncryptReturnType[]
    }
  }>(
    '/to-be-encrypted',
    {
      onRequest: [fastify.authenticate],
      schema: {
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
        return await fastify
          .dependencyInjectionContainer()
          .resolve('encryptionService')
          .encryptData(request.user, request.body,)
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
