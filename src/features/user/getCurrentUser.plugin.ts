import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import { JwtTokenType } from '@models/jwtToken.model'
import { UserType } from '@models/user.model'

declare module 'fastify' {
  interface FastifyInstance {
    getCurrentUser: (jwtToken: JwtTokenType) => UserType
  }
}

async function getCurrentUserPlugin(fastify: FastifyInstance): Promise<void> {
  const getCurrentUser = (jwtToken: JwtTokenType): UserType => {
    return {
      ...jwtToken,
    }
  }

  fastify.decorate('getCurrentUser', getCurrentUser)
}

export default fp(getCurrentUserPlugin)
