import { FastifyInstance } from 'fastify'
import { HealthResponse, HealthResponseType } from '@models/health.model'

export default async function (app: FastifyInstance): Promise<void> {
  app.get<{ Reply: HealthResponseType }>(
    '/health',
    {
      schema: {
        tags: ['Health'],
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
