import { FastifyInstance } from 'fastify'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { ForbiddenException } from '@src/shared/exceptions/ForbiddenException'
import { IdQueryString, IdQueryStringType } from '@src/shared/common.model'

export default async function (fastify: FastifyInstance): Promise<void> {
    fastify.delete<{
        Params: IdQueryStringType
    }>(
        '/:id',
        {
            onRequest: [fastify.authenticate],
            schema: {
                tags: ['Template'],
                params: IdQueryString,
                security: [
                    {
                        apiKey: [],
                    },
                ],
                response: {
                    204: {
                        type: 'null',
                        description: 'Template deleted successfully',
                    },
                    400: {
                        type: 'null',
                        description: 'bad request',
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
                    .delete(request.params.id)
                return reply.code(204).send()
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
