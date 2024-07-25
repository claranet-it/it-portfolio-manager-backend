import { FastifyInstance } from 'fastify'
import { UnauthorizedError } from '@src/core/customExceptions/UnauthorizedError'
import {
  CnaUserProfileList,
  CnaUserProfileListType,
  UserCompany,
  UserCompanyType,
} from '@src/core/User/model/user.model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Querystring: UserCompanyType
    Reply: CnaUserProfileListType | string
  }>(
    '/profiles',
    {
      schema: {
        tags: ['Users'],
        querystring: UserCompany,
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: CnaUserProfileList,
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
        await fastify
          .dependencyInjectionContainer()
          .resolve('authService')
          .checkApiKey({
            apiKey: request.headers['x-api-key'],
          })

        return await fastify
          .dependencyInjectionContainer()
          .resolve('userService')
          .getUsers({
            company: request.query.company,
          })
      } catch (error) {
        request.log.error(error)
        let errorMessage = ''
        let errorCode = 500
        if (error instanceof UnauthorizedError) {
          errorMessage = error.message
          errorCode = 401
        }
        return reply
          .code(errorCode)
          .send(JSON.stringify({ message: errorMessage }))
      }
    },
  )
}
