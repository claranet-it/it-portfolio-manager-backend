import { FastifyInstance } from 'fastify'
import {
  SkillMatrixReadParams,
  SkillMatrixReadParamsType,
  SkillMatrixResponse,
  SkillMatrixResponseType,
} from '@models/skillMatrix.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: SkillMatrixReadParamsType
    Reply: SkillMatrixResponseType
  }>(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Skill Matrix'],
        querystring: SkillMatrixReadParams,
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
        return await fastify.getAllSkillMatrix(request.query)
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
