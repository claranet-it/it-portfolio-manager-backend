import { FastifyInstance } from 'fastify'
import {
  SkillMatrix,
  SkillMatrixType,
} from '@models/skillMatrix.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Reply: SkillMatrixType
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
          200: SkillMatrix,
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
        return fastify.getMineSkillMatrix(request.user)
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
