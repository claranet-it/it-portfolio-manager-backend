import { FastifyInstance } from 'fastify'
import {
  HealthResponse,
  HealthResponseType,
} from '@src/core/Health/model/health.model'
import { sendEmail } from '@src/handlers/sendEmail';

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
      const from = "marteresa28@gmail.com";
      const to = "marteresa28@gmail.com"
      const body = `Mail created automatically.`
      sendEmail(from, to, "Unsubscribe Company", body)
      return { status: 'ok' }

    },
  )
}
