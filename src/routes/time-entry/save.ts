import { FastifyInstance } from 'fastify'
import {
  InsertTimeEntryRowType,
  InsertTimeEntryRow,
} from '@src/core/TimeEntry/model/timeEntry.model'
import { TaskNotExistsError } from '@src/core/customExceptions/TaskNotExistsError'
import { TimeEntryError } from '@src/core/customExceptions/TimeEntryError'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post<{
    Body: InsertTimeEntryRowType
  }>(
    '/:user',
    {
      onRequest: [fastify.authenticate],
      casbin: {
        rest: {
          getObj: 'time_entry',
          getAct: 'write',
        },
      },
      schema: {
        tags: ['Time entry'],
        body: InsertTimeEntryRow,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          204: {
            type: 'null',
            description: 'Time entry inserted successfully',
          },
          400: {
            type: 'null',
            description: 'bad request',
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
        await fastify
          .dependencyInjectionContainer()
          .resolve('timeEntryService')
          .save({
            user: user,
            company: request.user.company,
            ...request.body,
          })
        reply.code(204).send()
      } catch (error) {
        request.log.error(error)
        let errorCode = 500
        let errorMessage = error
        if (
          error instanceof TaskNotExistsError ||
          error instanceof TimeEntryError
        ) {
          errorCode = 400
          errorMessage = error.message
        }

        return reply
          .code(errorCode)
          .send(JSON.stringify({ message: errorMessage }))
      }
    },
  )
}
