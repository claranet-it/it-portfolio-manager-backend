import { FastifyInstance } from 'fastify'
import {
  WallpaperTemplateList,
} from '@src/core/WallpaperTemplate/model'
import { BadRequestException } from '@src/shared/exceptions/BadRequestException'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get(
    '/:key',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Wallpaper'],
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: WallpaperTemplateList,
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
        const { key } = request.params as { key: string }
        return await fastify
          .dependencyInjectionContainer()
          .resolve('wallpaperTemplateService')
          .getSignedUrl(key)
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
