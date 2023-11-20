import fp from 'fastify-plugin'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import fastifyJwt, { JwtHeader, TokenOrHeader } from '@fastify/jwt'
import buildGetJwks from 'get-jwks'
import { JwtTokenType } from '@src/core/JwtToken/model/jwtToken.model'
import * as process from 'process'

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

const getJwks = buildGetJwks()

const TEST_JWT_SECRET = Symbol('TEST-JWT-SECRET')

async function jwtPlugin(fastify: FastifyInstance): Promise<void> {
  const getFastifyJwtOptions = () => {
    if (process.env.STAGE_NAME === 'test') {
      return {
        secret: TEST_JWT_SECRET.toString(),
      }
    }
    return {
      decode: { complete: true },
      secret: (_request: FastifyRequest, token: TokenOrHeader) => {
        const jwtHeader: JwtHeader = 'header' in token ? token.header : token
        const { kid, alg } = jwtHeader
        const iss = 'payload' in token ? token.payload.iss : ''
        return getJwks.getPublicKey({ kid, domain: iss, alg })
      },
    }
  }

  fastify.register(fastifyJwt, getFastifyJwtOptions())

  fastify.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify()

        if (request.user.email && request.user.email.includes('it.clara.net')) {
          request.user.email = request.user.email.replace(
            'it.clara.net',
            'claranet.com',
          )
        }

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
