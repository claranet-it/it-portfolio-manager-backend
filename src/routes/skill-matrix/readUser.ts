import { FastifyInstance } from 'fastify'
import {
  SkillMatrixMineResponse,
  SkillMatrixMineResponseType,
} from '@src/core/SkillMatrix/model/skillMatrix.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Reply: SkillMatrixMineResponseType | string
  }>(
    '/:uid',
    {
      onRequest: [fastify.authenticate],
      casbin: {
        rest: {
          getObj: 'skill',
          getAct: 'read',
        },
      },
      schema: {
        tags: ['Skill Matrix'],
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: SkillMatrixMineResponse,
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
      const { uid } = request.params as { uid: string }
      const userObj = await fastify
        .dependencyInjectionContainer()
        .resolve('userProfileService')
        .getUserProfile(uid, request.user.company)
      if (!userObj) {
        return reply.code(404).send(`User ${uid} not found`)
      }

      if (request.user.role == 'TEAM_LEADER') {
        const teamLeader = await fastify
          .dependencyInjectionContainer()
          .resolve('userProfileService')
          .getUserProfile(request.user.email, request.user.company)
        if (teamLeader.crew != userObj.crew) {
          return reply
            .code(403)
            .send(`Cannot insert time entry for user ${uid}`)
        }
      }

      try {
        return await fastify
          .dependencyInjectionContainer()
          .resolve('skillMatrixService')
          .getUserSkillMatrixFormattedResponse(uid)
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
