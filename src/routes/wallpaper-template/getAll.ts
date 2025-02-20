import { FastifyInstance } from 'fastify'
import {
  WallpaperTemplateList,
} from '@src/core/WallpaperTemplate/model'

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get(
    '/',
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
        return await fastify
          .dependencyInjectionContainer()
          .resolve('wallpaperTemplateService')
          .getAll()
      } catch (error) {
        request.log.error(error)
        return reply.code(500).send()
      }
    },
  )
}
