import { FastifyInstance } from 'fastify'
import { MsalCallbackQueryParamType } from '@src/core/Auth/model/msal.auth.model'
import { ConfidentialClientApplication } from '@azure/msal-node'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: MsalCallbackQueryParamType
  }>(
    '/msalCallback',
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

      if (request.session.state !== query.state) {
        throw new Error('invalid state')
      }

      try {
        const msalClient = fastify
          .dependencyInjectionContainer()
          .resolve('msalClient') as ConfidentialClientApplication

        const token = await msalClient.acquireTokenByCode({
          code: query.code,
          redirectUri: process.env.MSAL_CALLBACK_URL!,
          scopes: ['User.Read'],
        })

        reply.redirect(`${request.session.referer}?token=${token.accessToken}`)
      } catch (error) {
        console.error(error)
        return reply.redirect(request.session.referer)
      }
    },
  )
}
