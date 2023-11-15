import { FastifyInstance } from 'fastify'
import {
  SkillMatrixMineResponse,
  SkillMatrixMineResponseType,
} from '@models/skillMatrix.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Reply: SkillMatrixMineResponseType
  }>(
    '/mine',
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
          200: SkillMatrixMineResponse,
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
          .getMineSkillMatrixFormattedReponse(request.user)
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
