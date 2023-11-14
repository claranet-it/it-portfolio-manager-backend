import { AwilixContainer, asClass } from 'awilix'
import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import * as awilix from 'awilix'
import { DynamoDBConnection } from '@src/infrastructure/db/DynamoDBConnection'
import { UserProfileRepository } from '@src/infrastructure/User/repository/UserProfileRepository'
import { UserProfileService } from '../User/service/UserProfileService'

declare module 'fastify' {
  interface FastifyInstance {
    dependencyInjectionContainer: () => AwilixContainer
  }
}

async function dependencyInjectionContainerPlugin(
  fastify: FastifyInstance,
): Promise<void> {
  const dependencyInjectionContainer = (): AwilixContainer => {
    const container = awilix.createContainer({
      injectionMode: awilix.InjectionMode.CLASSIC,
    })

    container.register({
      dynamoDBClient: awilix.asValue(DynamoDBConnection.getClient()),
    })
    container.register({
      userProfileRepository: asClass(UserProfileRepository),
    })
    container.register({
      userProfileService: asClass(UserProfileService),
    })

    return container
  }

  fastify.decorate('dependencyInjectionContainer', dependencyInjectionContainer)
}

export default fp(dependencyInjectionContainerPlugin)
