import { FastifyInstance } from 'fastify'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get(
    '/oauthCallback',
    {
      schema: {
        tags: ['Auth'],
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
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
     const query = request.query;
     if(query.error){
        console.error(query.error)
        reply.code(500).send()
     }
     const token = await fastify.dependencyInjectionContainer()
     .resolve('gooleAuthClient')
     .getToken(query.code)

     reply.send({token: token})

    },
  )
}
