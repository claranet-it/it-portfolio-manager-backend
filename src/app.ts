import 'module-alias/register'
import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify'
import autoload from '@fastify/autoload'
import { join } from 'path'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import cors from '@fastify/cors'
import {
  JwtInvalidTokenType,
  JwtTokenType,
} from '@src/core/JwtToken/model/jwtToken.model'
import { fastifyAwilixPlugin } from '@fastify/awilix'

declare module 'fastify' {
  interface FastifyInstance {
    createTestJwt: (jwtToken: JwtTokenType | JwtInvalidTokenType) => string
  }
}

export default function createApp(
  opts?: FastifyServerOptions,
): FastifyInstance {
  const defaultOptions = {
    logger: true,
    ignoreTrailingSlash: true,
  }

  const app = fastify({ ...defaultOptions, ...opts })

  app.register(swagger, {
    swagger: {
      info: {
        title: 'Portfolio Manager',
        description: 'Claranet Italy Portfolio Manager Backend',
        version: '0.1.0',
      },
      securityDefinitions: {
        apiKey: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
        },
      },
    },
    transform: ({ schema, url }) => {
      const stage_name = process.env.STAGE_NAME || 'dev'
      url = stage_name.concat(url)

      return { schema: schema, url: url }
    },
  })

  app.register(swaggerUI)

  app.register(cors, {})

  app.register(fastifyAwilixPlugin, {
    disposeOnClose: true,
    disposeOnResponse: true,
  })

  app.register(autoload, {
    dir: join(__dirname, 'core', 'plugin'),
  })

  app.register(autoload, {
    dir: join(__dirname, 'helpers'),
  })

  app.register(autoload, {
    dir: join(__dirname, 'routes'),
    options: { prefix: '/api' },
  })

  return app
}
