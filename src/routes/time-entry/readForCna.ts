import { FastifyInstance } from 'fastify'
import {
  CnaReadParamType,
  CnaReadParam,
  TimeEntriesForCnaList,
  TimeEntriesForCnaListType,
} from '@src/core/TimeEntry/model/timeEntry.model'
import {SSMClient} from "@src/infrastructure/SSM/SSMClient";
import {SSMClientInterface} from "@src/core/SSM/SSMClientInterface";
import {DummySSMClient} from "@src/infrastructure/SSM/DummySSMClient";

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: CnaReadParamType
    Reply: TimeEntriesForCnaListType | { error: string }
  }>(
    '/time-off-for-cna',
    {
      schema: {
        tags: ['Time entry'],
        querystring: CnaReadParam,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: TimeEntriesForCnaList,
          401: {
            type: 'null',
            description: 'Unauthorized',
          },
          403: {
            type: 'null',
            description: 'Invalid API Key',
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
        
        const apiKey = request.headers['x-api-key'];

        if (!apiKey) {
          return reply.status(401).send({ error: 'X-Api-Key header is required' });
        }

        const isTest = process.env.STAGE_NAME === 'test'
        const ssmClient: SSMClientInterface =
            isTest || process.env.IS_OFFLINE ? new DummySSMClient() : new SSMClient()
        const storedApiKey = await ssmClient.getBricklyApiKey();

        if (apiKey !== storedApiKey) {
          return reply.status(403).send({ error: 'Invalid API Key' });
        }

        return await fastify
          .dependencyInjectionContainer()
          .resolve('timeEntryService')
          .findTimeOffForCna({
            user: request.query.user,
            year: request.query.year,
            month: request.query.month,
          })
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
