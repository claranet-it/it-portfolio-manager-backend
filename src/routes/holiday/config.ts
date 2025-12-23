import { FastifyInstance } from 'fastify'
import {
  CompanyHolidayConfig,
  CompanyHolidayConfigList,
  CompanyHolidayConfigListType,
  CompanyHolidayConfigType,
  SaveCompanyHolidayConfig,
  SaveCompanyHolidayConfigType,
} from '@src/core/Holiday/model/holiday.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  // Get company holiday configurations
  fastify.get<{
    Reply: CompanyHolidayConfigListType
  }>(
    '/config',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Holiday'],
        summary: 'Get holiday configurations for the company (seniority-based tiers)',
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: CompanyHolidayConfigList,
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
        return await fastify
          .dependencyInjectionContainer()
          .resolve('holidayService')
          .getCompanyHolidayConfig(request.user.company)
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )

  // Save company holiday configuration
  fastify.post<{
    Body: SaveCompanyHolidayConfigType
    Reply: CompanyHolidayConfigType
  }>(
    '/config',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Holiday'],
        summary: 'Save a holiday configuration tier for the company',
        body: SaveCompanyHolidayConfig,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: CompanyHolidayConfig,
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
        return await fastify
          .dependencyInjectionContainer()
          .resolve('holidayService')
          .saveCompanyHolidayConfig(request.user.company, request.body)
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )

  // Delete company holiday configuration
  fastify.delete<{
    Params: { id: string }
  }>(
    '/config/:id',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Holiday'],
        summary: 'Delete a holiday configuration tier for the company',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
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
          .resolve('holidayService')
          .deleteCompanyHolidayConfig(request.user.company, request.params.id)

        return reply.code(204).send()
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}

