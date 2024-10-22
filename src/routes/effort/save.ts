import { FastifyInstance } from 'fastify'
import { EffortRow, EffortRowType } from '@src/core/Effort/model/effort'
import { UserProfileNotInitializedError } from '@src/core/customExceptions/UserProfileNotInitializedError'
import { EffortExceedsMaxError } from '@src/core/customExceptions/EffortExcedesMaxError'
import { Type } from '@sinclair/typebox'

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
          400: Type.Object({ message: Type.String() }),

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
          .saveEffort(request.body, request.user.company)

        reply.code(204).send()
      } catch (error) {
        request.log.error(error)
        let errorCode = 500
        let errorMessage = ''
        if (error instanceof UserProfileNotInitializedError) {
          errorCode = 304
          errorMessage = error.message
        }
        if (error instanceof EffortExceedsMaxError) {
          errorCode = 400
          errorMessage = error.message
        }
        return reply
          .code(errorCode)
          .send(JSON.stringify({ message: errorMessage }))
      }
    },
  )
}
