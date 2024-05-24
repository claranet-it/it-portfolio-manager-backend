import { FastifyInstance } from 'fastify'
import { randomBytes } from 'crypto'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get(
    '/',
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
      const state = randomBytes(32).toString('hex')
      request.session.state = state
      const redirectUrl = await fastify
        .dependencyInjectionContainer()
        .resolve('gooleAuthClient')
        .generateAuthUrl({
          access_type: 'offline',
          scope: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
          ],
          include_granted_scopes: true,
          state: state,
          redirect_uri:
            'http://localhost:3000/dev/api/auth/google/oauthCallback',
        })
      reply.redirect(redirectUrl)
    },
  )
}
