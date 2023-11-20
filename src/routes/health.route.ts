import { FastifyInstance } from 'fastify'
import {
  HealthResponse,
  HealthResponseType,
} from '@src/core/Health/model/health.model'

export default async function (app: FastifyInstance): Promise<void> {
  app.get<{ Reply: HealthResponseType }>(
    '/health',
    {
      schema: {
        tags: ['System'],
        response: {
          200: HealthResponse,
        },
      },
    },
    async () => {
      return { status: 'ok' }
    },
  )
}
