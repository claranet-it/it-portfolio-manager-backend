import { FastifyInstance } from 'fastify'
import {DecodedToken, DecodedTokenType} from "@models/user.model";

export default async function (
  fastify: FastifyInstance
): Promise<void> {
  fastify.get<{ Reply: DecodedTokenType }>(
    '/me',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Users'],
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: DecodedToken,
          500: {
            type: 'null',
            description: 'Error retrieving user',
          },
        },
      },
    },
    async (request, reply) => {
      try {
        return {
          raw: JSON.stringify(request.user),
        }
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
