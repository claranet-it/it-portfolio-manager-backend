import { FastifyInstance } from 'fastify'

import { InvalidCharacterError } from '@src/core/customExceptions/InvalidCharacterError'
import { TemplateCreateParams, TemplateCreateParamsType } from '@src/core/Template/model'

export default async function (fastify: FastifyInstance): Promise<void> {
    fastify.post<{
        Body: TemplateCreateParamsType
    }>(
        '/',
        {
            onRequest: [fastify.authenticate],
            schema: {
                tags: ['Template'],
                body: TemplateCreateParams,
                security: [
                    {
                        apiKey: [],
                    },
                ],
                response: {
                    204: {
                        type: 'null',
                        description: 'Template saved successfully',
                    },
                    400: {
                        type: 'null',
                        description: 'Bad request',
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
                    .resolve('templateService')
                    .save({ ...request.body, userEmail: request.user.email, company: request.user.company })
                return reply.send(JSON.stringify({ message: 'OK' }))
            } catch (error) {
                request.log.error(error)
                let errorCode = 500
                let errorMessage = ''
                if (error instanceof InvalidCharacterError) {
                    errorCode = 400
                    errorMessage = error.message
                }
                return reply
                    .code(errorCode)
                    .send(JSON.stringify({ message: errorMessage }))
            }
        },
    )
}
