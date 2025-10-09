import createApp from '@src/app'
import { FastifyInstance } from 'fastify'




export async function handler() {
  console.log('Monday Project Report Mailer started at:', new Date().toISOString());
  const app: FastifyInstance = createApp();
  await app.ready();

  await app.dependencyInjectionContainer().resolve('mondayProjectReportMailer')

  await app.close();
}
