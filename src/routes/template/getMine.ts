import { FastifyInstance } from 'fastify'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { ForbiddenException } from '@src/shared/exceptions/ForbiddenException'
import { TemplateArray } from '@src/core/Template/model'

export default async function (fastify: FastifyInstance): Promise<void> {
    fastify.get(
        '/',
        {
            onRequest: [fastify.authenticate],
            schema: {
                tags: ['Template'],
                security: [
                    {
                        apiKey: [],
                    },
                ],
                response: {
                    200: TemplateArray,
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
                    .resolve('templateService')
                    .get(request.user.email)
            } catch (error) {
                request.log.error(error)
                if (error instanceof NotFoundException) {
                    return reply.code(404).send()
                }
                if (error instanceof ForbiddenException) {
                    return reply.code(403).send()
                }
                return reply.code(500).send()
            }
        },
    )
}
