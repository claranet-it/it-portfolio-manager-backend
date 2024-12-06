import { UserProfileNotInitializedError } from '@src/core/customExceptions/UserProfileNotInitializedError'
import {
  SkillMatrixUpdateParams,
  SkillMatrixUpdateParamsType,
} from '@src/core/SkillMatrix/model/skillMatrix.model'
import { FastifyInstance } from 'fastify'
import { JwtTokenType } from '@src/core/JwtToken/model/jwtToken.model'
import { UserProfileType } from '@src/core/User/model/user.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.patch<{ Body: SkillMatrixUpdateParamsType }>(
    '/:user',
    {
      onRequest: [fastify.authenticate],
      casbin: {
        rest: {
          getObj: 'skill',
          getAct: 'write',
        },
      },
      schema: {
        tags: ['Skill Matrix'],
        body: SkillMatrixUpdateParams,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          204: {
            type: 'null',
            description: 'Skill matrix updated successfully',
          },
          304: {
            type: 'null',
            description: 'Not modified',
          },
          400: {
            type: 'null',
            description: 'Bad request',
          },
          401: {
            type: 'null',
            description: 'Unauthorized',
          },
          403: {
            type: 'null',
            description: 'Forbidden',
          },
          500: {
            type: 'null',
            description: 'Internal server error',
          },
        },
      },
    },
    async (request, reply) => {
      const { user } = request.params as { user: string }
      const userObj: UserProfileType = await fastify
        .dependencyInjectionContainer()
        .resolve('userProfileService')
        .getUserProfile(user, request.user.company)
      if (!userObj) {
        return reply.code(404).send(`User ${user} not found`)
      }

      if (request.user.role == 'TEAM_LEADER') {
        const teamLeader = await fastify
          .dependencyInjectionContainer()
          .resolve('userProfileService')
          .getUserProfile(request.user.email, request.user.company)
        if (teamLeader.crew != userObj.crew) {
          return reply.code(403).send(`Cannot insert skill for user ${user}`)
        }
      }

      try {
        await fastify
          .dependencyInjectionContainer()
          .resolve('skillMatrixService')
          .save(
            { ...userObj, email: user, picture: '' } as JwtTokenType,
            request.body,
          )
        reply.code(204).send()
      } catch (error) {
        let errorCode = 500
        let errorMessage = ''
        if (error instanceof UserProfileNotInitializedError) {
          errorCode = 304
          errorMessage = error.message
        }

        request.log.error(error)
        return reply
          .code(errorCode)
          .send(JSON.stringify({ message: errorMessage }))
      }
    },
  )
}
