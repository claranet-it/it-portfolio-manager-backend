import { OauthCallbackQueryParamType } from '@src/core/Auth/model/google.auth.model'
import { FastifyInstance } from 'fastify'
import { OAuth2Client } from 'google-auth-library'

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
        return reply.redirect(request.session.referer)
      }
      if (request.session.state !== query.state) {
        throw new Error('invalid state')
      }
      const oauthClient = fastify
        .dependencyInjectionContainer()
        .resolve('gooleAuthClient') as OAuth2Client
      const token = await oauthClient.getToken(request.query.code ?? '')
      reply.redirect(
        `${request.session.referer}?token=${token.tokens.id_token}`,
      )
    },
  )
}
