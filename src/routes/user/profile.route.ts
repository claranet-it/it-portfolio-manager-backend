import { FastifyInstance } from 'fastify'
import {
  UpdateUserProfile,
  UpdateUserProfileType,
} from '@src/core/User/model/user.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: UpdateUserProfileType }>(
    '/profile',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Users'],
        body: UpdateUserProfile,
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
          .saveUserProfile(
            request.user.email,
            request.user.name,
            request.user.company,
            {
              ...request.body,
            },
          )

        await fastify
          .dependencyInjectionContainer()
          .resolve('skillMatrixService')
          .updateSkillMatrixOfUser({
            uid: request.user.email,
            name: request.user.name,
            crew: request.body.crew,
            company: request.user.company,
          })

        reply.code(201).send()
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
