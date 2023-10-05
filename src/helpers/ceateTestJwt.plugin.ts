import { JwtInvalidTokenType, JwtTokenType } from '@models/jwtToken.model'
import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

async function createTestJwtPlugin(fastify: FastifyInstance): Promise<void> {
  const createTestJwt = (jwtToken: JwtTokenType | JwtInvalidTokenType): string =>
    fastify.jwt.sign(jwtToken)

  fastify.decorate('createTestJwt', createTestJwt)
}

export default fp(createTestJwtPlugin)
