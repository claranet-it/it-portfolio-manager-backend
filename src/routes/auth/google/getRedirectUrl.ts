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
    async (_request, reply) => {      
     const redirectUrl =  await fastify.dependencyInjectionContainer()
      .resolve('gooleAuthClient')
      .generateAuthUrl({        
        access_type: 'offline',       
        scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],    
        include_granted_scopes: true,        
        state: randomBytes(32).toString('hex'),
        redirect_uri: 'http://localhost:3000/dev/api/auth/google/oauthCallback'
      })
      reply.redirect(redirectUrl)
    },
  )
}
