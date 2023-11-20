import { FastifyInstance } from 'fastify'
import { UserProfileType, UserProfile } from '@src/core/User/model/user.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: UserProfileType }>(
    '/profile',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Users'],
        body: UserProfile,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          201: {
            type: 'null',
            description: 'User profile updated successfully',
          },
          400: {
            type: 'null',
            description: 'Bad request',
          },
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
      try {
        await fastify
          .dependencyInjectionContainer()
          .resolve('userProfileService')
          .saveUserProfile(request.user.email, request.body)

        await fastify
          .dependencyInjectionContainer()
          .resolve('skillMatrixService')
          .updateSkillMatrixOfUser(
            request.user.email,
            request.body.crew,
            request.body.company,
          )

        reply.code(201).send()
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
