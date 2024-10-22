import { FastifyInstance } from 'fastify'
import { Type } from '@sinclair/typebox'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.post<{
    Body: string
  }>(
    '/import/csv',
    {
      onRequest: [fastify.authenticate],
      casbin: {
        rest: {
          getObj: 'time_entry',
          getAct: 'import',
        },
      },
      schema: {
        tags: ['Time entry'],
        body: Type.String(),
        security: [
          {
            apiKey: [],
          },
        ],
        // response: {
        //   200: {
        //     type: CSVImportErrors,
        //     description: 'Time entries imported successfully',
        //   },
        //   400: {
        //     type: 'null',
        //     description: 'bad request',
        //   },
        //   401: {
        //     type: 'null',
        //     description: 'Unauthorized',
        //   },
        //   500: {
        //     type: 'null',
        //     description: 'Internal server error',
        //   },
        // },
      },
    },
    async (request, reply) => {
      try {
        const errors = await fastify
          .dependencyInjectionContainer()
          .resolve('timeEntryService')
          .csvImport({
            company: request.user.company,
            data: request.body,
          })

        return errors
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send(JSON.stringify({ message: error }))
      }
    },
  )
}
