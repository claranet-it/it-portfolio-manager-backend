import fp from 'fastify-plugin'
import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from 'fastify'
import fastifyJwt, {JwtHeader, TokenOrHeader} from '@fastify/jwt'
import buildGetJwks from "get-jwks";

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

const getJwks = buildGetJwks()

async function jwtPlugin(
  fastify: FastifyInstance,
): Promise<void> {
  fastify.register(fastifyJwt, {
    decode: { complete: true },
    secret: (_request: FastifyRequest, token: TokenOrHeader) => {
      const jwtHeader: JwtHeader = 'header' in token ? token.header : token
      const { kid, alg } = jwtHeader
      const iss = 'payload' in token ? token.payload.iss : ''
      return getJwks.getPublicKey({ kid, domain: iss, alg })
    }
  })

  fastify.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify()
      } catch (err) {
        reply.send(err)
      }
    },
  )
}

export default fp(jwtPlugin)
