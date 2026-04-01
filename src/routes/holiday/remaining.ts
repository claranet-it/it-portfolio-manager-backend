import { FastifyInstance } from 'fastify'
import { Type } from '@sinclair/typebox'
import {
  RemainingHolidaysQueryParams,
  RemainingHolidaysQueryParamsType,
  RemainingHolidaysResponse,
  RemainingHolidaysResponseType,
} from '@src/core/Holiday/model/holiday.model'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { CompleteUserProfileType } from '@src/core/User/model/user.model'

const RemainingHolidaysListResponse = Type.Array(RemainingHolidaysResponse)

export default async function (fastify: FastifyInstance): Promise<void> {
  // Get remaining holidays for the current user
  fastify.get<{
    Querystring: RemainingHolidaysQueryParamsType
    Reply: RemainingHolidaysResponseType
  }>(
    '/remaining',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Holiday'],
        summary: 'Get remaining holiday hours for the current user',
        querystring: RemainingHolidaysQueryParams,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: RemainingHolidaysResponse,
          401: {
            type: 'null',
            description: 'Unauthorized',
          },
          404: {
            type: 'null',
            description: 'Holiday configuration not found',
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
        return await fastify
          .dependencyInjectionContainer()
          .resolve('holidayService')
          .getRemainingHolidays(
            request.user.email,
            request.user.company,
            request.query.year,
          )
      } catch (error) {
        if (error instanceof NotFoundException) {
          request.log.warn(error.message)
          return reply.code(404).send()
        }
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )

  // Get remaining holidays for all users (admin/team leader)
  fastify.get<{
    Querystring: RemainingHolidaysQueryParamsType
    Reply: RemainingHolidaysResponseType[]
  }>(
    '/remaining/all',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Holiday'],
        summary: 'Get remaining holiday hours for all users (admin/team leader)',
        querystring: RemainingHolidaysQueryParams,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: RemainingHolidaysListResponse,
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
          .getAllRemainingHolidays(
            request.user.company,
            request.query.year,
          )

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

            results = results.filter((r: RemainingHolidaysResponseType) => crewEmails.includes(r.email))
          }
        }

        return results
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )

  // Get remaining holidays for a specific user (admin/team leader)
  fastify.get<{
    Params: { email: string }
    Querystring: RemainingHolidaysQueryParamsType
    Reply: RemainingHolidaysResponseType
  }>(
    '/remaining/:email',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Holiday'],
        summary: 'Get remaining holiday hours for a specific user',
        params: {
          type: 'object',
          properties: {
            email: { type: 'string' },
          },
          required: ['email'],
        },
        querystring: RemainingHolidaysQueryParams,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: RemainingHolidaysResponse,
          401: {
            type: 'null',
            description: 'Unauthorized',
          },
          403: {
            type: 'null',
            description: 'Forbidden',
          },
          404: {
            type: 'null',
            description: 'Holiday configuration not found',
          },
          500: {
            type: 'null',
            description: 'Internal server error',
          },
        },
      },
    },
    async (request, reply) => {
      const targetEmail = request.params.email
      const role = request.user.role

      // Allow self-access for any user
      if (targetEmail !== request.user.email) {
        // Only ADMIN, SUPERADMIN, or TEAM_LEADER can access other users
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
          .getRemainingHolidays(
            targetEmail,
            request.user.company,
            request.query.year,
          )
      } catch (error) {
        if (error instanceof NotFoundException) {
          request.log.warn(error.message)
          return reply.code(404).send()
        }
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}

