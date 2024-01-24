import { FastifyInstance } from 'fastify'
import { EffortRow, EffortRowType } from '@src/core/Effort/model/effort'
import { UserProfileNotInitializedError } from '@src/core/customExceptions/UserProfileNotInitializedError'
import { EffortExcedsMaxError } from '@src/core/customExceptions/EffortExcedesMaxError'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.put<{
    Body: EffortRowType
  }>(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Effort'],
        body: EffortRow,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          204: {
            type: 'null',
            description: 'Effort saved successfully',
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
        await fastify
          .dependencyInjectionContainer()
          .resolve('effortService')
          .saveEffort(request.body)

        reply.code(204).send()
      } catch (error) {
        let errorCode = 500
        let errorMessage = ''
        if (error instanceof UserProfileNotInitializedError) {
          errorCode = 304
          errorMessage = error.message
        }
        if (error instanceof EffortExcedsMaxError) {
          errorCode = 400
          errorMessage = error.message
        }

        request.log.error(error)
        return reply.code(errorCode).send(errorMessage)
      }
    },
  )
}
