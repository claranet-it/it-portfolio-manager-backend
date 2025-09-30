import { FastifyInstance } from 'fastify'
import {
  NetworkingSkillsResponse,
  NetworkingSkillsResponseType,
} from '@src/core/Networking/model/networking.model'
import { Type } from '@sinclair/typebox'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Reply: NetworkingSkillsResponseType
    Querystring: { includeUnconnectedCompanies?: boolean }
  }>(
    '/skills',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Other Companies Skills'],
        security: [
          {
            apiKey: [],
          },
        ],
        querystring: Type.Object({
          includeUnconnectedCompanies: Type.Optional(Type.Boolean()),
        }),
        response: {
          200: NetworkingSkillsResponse,
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
        const { includeUnconnectedCompanies = false } = request.query
        return await fastify
          .dependencyInjectionContainer()
          .resolve('networkingService')
          .getNetworkingAverageSkillsOf(request.user.company, includeUnconnectedCompanies)
      } catch (error) {
        console.log('Error fetching networking skills:', error)
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
