import { FastifyInstance } from 'fastify'
import { Type } from '@sinclair/typebox'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Reply: { privateKey: string, symmetricKey: string }
  }>(
    '/:companyId',
    {
      //onRequest: [fastify.authenticate],
      schema: {
        tags: ['Company'],
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: Type.Object({
            privateKey: Type.String(),
            symmetricKey: Type.String(),
          }),
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
        console.log(request.params)
        return { privateKey: 'pk', symmetricKey: 'sk' }
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
