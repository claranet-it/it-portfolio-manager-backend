import { FastifyInstance } from 'fastify'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { ForbiddenException } from '@src/shared/exceptions/ForbiddenException'
import { CurriculumUpdate, CurriculumUpdateType } from '@src/core/Curriculum/model'


export default async function (fastify: FastifyInstance): Promise<void> {
    fastify.patch<{
        Body: CurriculumUpdateType
    }>(
        '/',
        {
            onRequest: [fastify.authenticate],
            schema: {
                tags: ['Curriculum'],
                body: CurriculumUpdate,
                security: [
                    {
                        apiKey: [],
                    },
                ],
                response: {
                    204: { type: 'null', description: 'No Content' },
                    401: {
                        type: 'null',
                        description: 'Unauthorized',
                    },
                    403: {
                        type: 'null',
                        description: 'Forbidden',
                    },
                    404: {
                        type: 'null',
                        description: 'Not Found',
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
                    .resolve('curriculumService')
                    .updateCurriculum({ userEmail: request.user.email, ...request.body })
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
