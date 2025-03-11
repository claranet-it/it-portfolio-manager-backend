import { FastifyInstance } from 'fastify'
import {
    Curriculum,
    GetCurriculumByEmail,
    GetCurriculumByEmailType,
} from '@src/core/Curriculum/model'
import { BadRequestException } from '@src/shared/exceptions/BadRequestException'

export default async function (fastify: FastifyInstance): Promise<void> {
    fastify.get<{
        Params: GetCurriculumByEmailType
    }>(
        '/:email',
        {
            schema: {
                tags: ['Curriculum'],
                params: GetCurriculumByEmail,
                security: [
                    {
                        apiKey: [],
                    },
                ],
                response: {
                    200: Curriculum,
                    400: {
                        type: 'null',
                        description: 'bad request',
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
                const { email } = request.params as { email: string }
                return await fastify
                    .dependencyInjectionContainer()
                    .resolve('curriculumService')
                    .get({
                        email,
                    })
            } catch (error) {
                request.log.error(error)
                if (error instanceof BadRequestException) {
                    return reply.code(400).send()
                }
                return reply.code(500).send()
            }
        },
    )
}
