import {
  openAIPrompt,
  openAIPromptType,
  openAIResponse,
} from '@src/core/OpenAI/model/openAI'
import { FastifyInstance } from 'fastify'

export default async function name(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: openAIPromptType }>(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        body: openAIPrompt,
        tags: ['openAI'],
        response: {
          200: openAIResponse,
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
        return await fastify
          .dependencyInjectionContainer()
          .resolve('openAIService')
          .answerQuestionWithSkillsAndEffort(
            request.body.prompt,
            request.body.company,
          )
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
