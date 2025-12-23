import { FastifyInstance } from 'fastify'
import {
  SaveUserHolidayBase,
  SaveUserHolidayBaseType,
  UserHolidayBase,
  UserHolidayBaseType,
} from '@src/core/Holiday/model/holiday.model'
import { Type } from '@sinclair/typebox'
import { CompleteUserProfileType } from '@src/core/User/model/user.model'

const UserHolidayBaseList = Type.Array(UserHolidayBase)

export default async function (fastify: FastifyInstance): Promise<void> {
  // Get user holiday base for the current user
  fastify.get<{
    Reply: UserHolidayBaseType | null
  }>(
    '/user-base',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Holiday'],
        summary: 'Get holiday base configuration for the current user',
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: UserHolidayBase,
          401: {
            type: 'null',
            description: 'Unauthorized',
          },
          404: {
            type: 'null',
            description: 'Not found',
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
        const result = await fastify
          .dependencyInjectionContainer()
          .resolve('holidayService')
          .getUserHolidayBase(request.user.email, request.user.company)

        if (!result) {
          return reply.code(404).send()
        }

        return result
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )

  // Get all user holiday bases (admin/team leader only)
  fastify.get<{
    Reply: UserHolidayBaseType[]
  }>(
    '/user-base/all',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Holiday'],
        summary: 'Get holiday base configuration for all users (admin/team leader)',
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: UserHolidayBaseList,
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
      const role = request.user.role

      // Only ADMIN, SUPERADMIN, or TEAM_LEADER can access this
      if (!role || !['ADMIN', 'SUPERADMIN', 'TEAM_LEADER'].includes(role)) {
        return reply.code(403).send()
      }

      try {
        let results = await fastify
          .dependencyInjectionContainer()
          .resolve('holidayService')
          .getAllUserHolidayBases(request.user.company)

        // If TEAM_LEADER, filter to only their crew members
        if (role === 'TEAM_LEADER') {
          const userProfileService = fastify
            .dependencyInjectionContainer()
            .resolve('userProfileService')

          const teamLeader = await userProfileService.getUserProfile(
            request.user.email,
            request.user.company,
          )

          if (teamLeader?.crew) {
            const companyUsers = await userProfileService.getByCompany(
              request.user.company,
            )
            const crewEmails = companyUsers
              .filter((u: CompleteUserProfileType) => u.crew === teamLeader.crew)
              .map((u: CompleteUserProfileType) => u.uid)

            results = results.filter((r: UserHolidayBaseType) => crewEmails.includes(r.email))
          }
        }

        return results
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )

  // Save user holiday base (users can save their own, admins/team leaders can save for others)
  fastify.post<{
    Body: SaveUserHolidayBaseType
    Reply: UserHolidayBaseType
  }>(
    '/user-base',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Holiday'],
        summary: 'Save holiday base configuration for a user',
        body: SaveUserHolidayBase,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: UserHolidayBase,
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
      const targetEmail = request.body.email
      const role = request.user.role

      // Check access control
      if (targetEmail !== request.user.email) {
        // Only ADMIN, SUPERADMIN, or TEAM_LEADER can modify other users
        if (!role || !['ADMIN', 'SUPERADMIN', 'TEAM_LEADER'].includes(role)) {
          return reply.code(403).send()
        }

        // If TEAM_LEADER, check if target user is in their crew
        if (role === 'TEAM_LEADER') {
          const userProfileService = fastify
            .dependencyInjectionContainer()
            .resolve('userProfileService')

          const teamLeader = await userProfileService.getUserProfile(
            request.user.email,
            request.user.company,
          )
          const targetUser = await userProfileService.getUserProfile(
            targetEmail,
            request.user.company,
          )

          if (!targetUser || teamLeader?.crew !== targetUser.crew) {
            return reply.code(403).send()
          }
        }
      }

      try {
        return await fastify
          .dependencyInjectionContainer()
          .resolve('holidayService')
          .saveUserHolidayBase(request.user.company, request.body)
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )

  // Delete user holiday base (admin only)
  fastify.delete<{
    Params: { email: string }
  }>(
    '/user-base/:email',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Holiday'],
        summary: 'Delete holiday base configuration for a user (admin only)',
        params: {
          type: 'object',
          properties: {
            email: { type: 'string' },
          },
          required: ['email'],
        },
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          204: {
            type: 'null',
            description: 'Successfully deleted',
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
      const role = request.user.role

      // Only ADMIN or SUPERADMIN can delete
      if (!role || !['ADMIN', 'SUPERADMIN'].includes(role)) {
        return reply.code(403).send()
      }

      try {
        await fastify
          .dependencyInjectionContainer()
          .resolve('holidayService')
          .deleteUserHolidayBase(request.params.email, request.user.company)

        return reply.code(204).send()
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}

