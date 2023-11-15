import { UserProfileNotInitializedError } from '@src/core/customExceptions/UserProfileNotInitializedError'
import {
  SkillMatrixUpdateParams,
  SkillMatrixUpdateParamsType,
} from '@src/models/skillMatrix.model'
import { FastifyInstance } from 'fastify'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.patch<{ Body: SkillMatrixUpdateParamsType }>(
    '/mine',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Skill Matrix'],
        body: SkillMatrixUpdateParams,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          204: {
            type: 'null',
            description: 'Skill matrix updated successfully',
          },
          304: {
            type: 'null',
            description: 'Not modified',
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
        await fastify.dependencyInjectionContainer().resolve('skillMatrixService').saveMineSkillMatrix(request.user, request.body)
        reply.code(204).send()
      } catch (error) {
        let errorCode = 500
        let errorMessage = ''
        if (error instanceof UserProfileNotInitializedError) {
          errorCode = 304
          errorMessage = error.message
        }

        request.log.error(error)
        return reply.code(errorCode).send(errorMessage)
      }
    },
  )
}
