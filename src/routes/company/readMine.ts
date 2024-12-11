import { FastifyInstance } from 'fastify'
import {
  CompanyWithSkills,
  CompanyWithSkillsType,
} from '@src/core/Company/model/Company'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Reply: CompanyWithSkillsType
  }>(
    '/mine',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Company'],
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: CompanyWithSkills,
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
          .resolve('companyService')
          .getMine(request.user)
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
