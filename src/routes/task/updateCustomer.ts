import { FastifyInstance } from 'fastify'
import {
  CustomerUpdateParams, CustomerUpdateQueryParamsType,
} from '@src/core/Task/model/task.model'
import { InvalidCharacterError } from '@src/core/customExceptions/InvalidCharacterError'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.put<{
    Body: CustomerUpdateQueryParamsType
  }>(
    '/customer',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Task'],
        body: CustomerUpdateParams,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          204: {
            type: 'null',
            description: 'Customer updated successfully',
          },
          400: {
            type: 'null',
            description: 'Bad request',
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
        return await fastify
          .dependencyInjectionContainer()
          .resolve('taskService')
          .updateCustomer({ ...request.body, company: request.user.company })
      } catch (error) {
        request.log.error(error)
        let errorCode = 500
        let errorMessage = ''
        if (error instanceof InvalidCharacterError) {
          errorCode = 400
          errorMessage = error.message
        }
        return reply.code(errorCode).send(errorMessage)
      }
    },
  )
}
