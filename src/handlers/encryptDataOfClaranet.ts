import createApp from '@src/app'
import { FastifyInstance } from 'fastify'




export async function handler() {
  const app: FastifyInstance = createApp();
  await app.ready();

  await app.dependencyInjectionContainer().resolve('encryptionService')
    .encryptClaranetData();

  await app.close();
}
