import { FastifyInstance } from 'fastify'
import {
  TimeEntryReadParamType,
  TimeEntryReadParam,
  TimeEntryRowWithProjectEntityListType,
  TimeEntryRowWithProjectEntityList,
} from '@src/core/TimeEntry/model/timeEntry.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: TimeEntryReadParamType
    Reply: TimeEntryRowWithProjectEntityListType
  }>(
    '/:user',
    {
      onRequest: [fastify.authenticate],
      casbin: {
        rest: {
          getObj: 'time_entry',
          getAct: 'read',
        },
      },
      schema: {
        tags: ['Time entry'],
        querystring: TimeEntryReadParam,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: TimeEntryRowWithProjectEntityList,
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
      const userObj = await fastify
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
          return reply
            .code(403)
            .send(`Cannot insert time entry for user ${user}`)
        }
      }

      try {
        return await fastify
          .dependencyInjectionContainer()
          .resolve('timeEntryService')
          .find({
            user: user,
            from: request.query.from,
            to: request.query.to,
          })
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
