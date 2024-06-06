import fp from 'fastify-plugin'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import fastifyJwt from '@fastify/jwt'
import { JwtTokenType } from '@src/core/JwtToken/model/jwtToken.model'
import * as process from 'process'
import { SSMClient } from '@src/infrastructure/SSM/SSMClient'

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: JwtTokenType
  }
}

const TEST_JWT_SECRET = Symbol('TEST-JWT-SECRET')

async function jwtPlugin(fastify: FastifyInstance): Promise<void> {
  const getFastifyJwtOptions = async () => {
    if (process.env.STAGE_NAME === 'test' || process.env.STAGE_NAME === 'dev') {
      return {
        secret: TEST_JWT_SECRET.toString(),
      }
    }
    const ssmClient = new SSMClient()
    return {
      decode: { complete: true },
      secret: {
        private: await ssmClient.getJwtPrivateKey(),
        public: await ssmClient.getJWTPublicKey(),
      },
    }
  }

  fastify.register(fastifyJwt, await getFastifyJwtOptions())

  fastify.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify()
        if (
          !request.user.email ||
          !request.user.name ||
          !request.user.picture
        ) {
          reply.code(401).send('Invalid Token')
        }
      } catch (err) {
        reply.send(err)
      }
    },
  )
}

export default fp(jwtPlugin)
