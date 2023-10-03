import { FastifyInstance } from 'fastify'
import {
  SkillMatrix,
  SkillMatrixReadParamsType,
  SkillMatrixType,
} from '@models/skillMatrix.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: SkillMatrixReadParamsType
    Reply: SkillMatrixType
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
          200: SkillMatrix,
          401: {
            type: 'null',
            description: 'Unauthorized',
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { uid } = request.query
        return fastify.getSkillMatrix(uid)
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
