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
     const redirectUrl =  await fastify.dependencyInjectionContainer()
      .resolve('gooleAuthClient')
      .generateAuthUrl({        
        access_type: 'offline',       
        scope: ['https://www.googleapis.com/auth/drive.metadata.readonly'],    
        include_granted_scopes: true,        
        state: randomBytes(32).toString('hex')
      })
      reply.redirect(redirectUrl)
    },
  )
}
