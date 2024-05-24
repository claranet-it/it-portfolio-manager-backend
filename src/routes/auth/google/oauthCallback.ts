import { OauthCallbackQueryParamType } from '@src/core/Auth/model/google.auth.model'
import { FastifyInstance } from 'fastify'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: OauthCallbackQueryParamType
  }>(
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
      const query = request.query
      if (query.error) {
        console.error(query.error)
       return  reply.code(500).send()
      }
      console.log(request.session.state)
      if(request.session.state !== query.state){
        throw new Error('invalid state')
      }
      const token = await fastify
        .dependencyInjectionContainer()
        .resolve('gooleAuthClient')
        .getToken(query.code)

      reply.redirect(`http://localhost:5173?token=${token}`)
    },
  )
}
