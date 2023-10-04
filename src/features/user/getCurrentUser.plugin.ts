import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import { JwtTokenType } from '@models/jwtToken.model'
import { UserWithProfileType } from '@models/user.model'

declare module 'fastify' {
  interface FastifyInstance {
    getCurrentUser: (jwtToken: JwtTokenType) => Promise<UserWithProfileType>
  }
}

async function getCurrentUserPlugin(fastify: FastifyInstance): Promise<void> {
  const getCurrentUser = async (
    jwtToken: JwtTokenType,
  ): Promise<UserWithProfileType> => {
    const userProfile = await fastify.getUserProfile(jwtToken.email)
    if (!userProfile) {
      return {
        ...jwtToken,
      }
    }
    return {
      ...jwtToken,
      crew: userProfile.crew,
      company: userProfile.company,
    }
  }

  fastify.decorate('getCurrentUser', getCurrentUser)
}

export default fp(getCurrentUserPlugin)
