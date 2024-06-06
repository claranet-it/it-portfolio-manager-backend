import { FastifyInstance } from 'fastify'
import {
  SkillMatrixResponse,
  SkillMatrixResponseType,
} from '@src/core/SkillMatrix/model/skillMatrix.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Reply: SkillMatrixResponseType
  }>(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Skill Matrix'],
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: SkillMatrixResponse,
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
          .resolve('skillMatrixService')
          .getAllSkillMatrixFormattedResponse({ company: request.user.company })
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
