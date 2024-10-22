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
import fastifySession from '@fastify/session'
import { randomBytes } from 'crypto'
import fastifyCookie from '@fastify/cookie'
import fastifyEnv from '@fastify/env'
import * as process from 'node:process'
import fastifyCasbin from 'fastify-casbin'
import fastifyCasbinRest from 'fastify-casbin-rest'

declare module 'fastify' {
  interface FastifyInstance {
    createTestJwt: (jwtToken: JwtTokenType | JwtInvalidTokenType) => string
  }
  interface Session {
    state: string
    referer: string
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
        title: 'Brickly',
        description: 'Skill-based Capaciy Planning Tool',
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

  const schema = {
    type: 'object',
    required: ['DATABASE_URL'],
    properties: {
      DATABASE_URL: {
        type: 'string',
      },
    },
  }

  const options = {
    schema: schema,
    dotenv: true,
  }

  app.register(fastifyEnv, options)

  app.register(fastifyCookie)
  app.register(fastifySession, {
    secret: randomBytes(32).toString('hex'),
    cookie: { secure: false },
  })

  app.register(cors, {})

  app.register(fastifyAwilixPlugin, {
    disposeOnClose: true,
    disposeOnResponse: true,
  })

  app.register(fastifyCasbin, {
    model: 'basic_model.conf',
    adapter: 'basic_policy.csv',
  })

  app.register(fastifyCasbinRest, {
    getSub: (r) => r.user.role,
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
