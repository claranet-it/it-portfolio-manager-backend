import { FastifyInstance } from 'fastify'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { ForbiddenException } from '@src/shared/exceptions/ForbiddenException'
import { EducationCreate, EducationCreateType } from '@src/core/Education/model'

export default async function (fastify: FastifyInstance): Promise<void> {
    fastify.post<{
        Body: EducationCreateType
    }>(
        '/',
        {
            onRequest: [fastify.authenticate],
            schema: {
                tags: ['Curriculum'],
                body: EducationCreate,
                security: [
                    {
                        apiKey: [],
                    },
                ],
                response: {
                    201: {
                        type: 'null',
                        description: 'Education inserted successfully',
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
                    .resolve('educationService')
                    .addEducation({
                        userEmail: request.user.email,
                        ...request.body,
                    })
                reply.code(204).send()
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
