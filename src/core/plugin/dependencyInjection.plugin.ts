import { AwilixContainer, asClass } from 'awilix'
import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import * as awilix from 'awilix'
import { DynamoDBConnection } from '@src/infrastructure/db/DynamoDBConnection'
import { UserProfileRepository } from '@src/infrastructure/User/repository/UserProfileRepository'
import { UserProfileService } from '../User/service/UserProfileService'
import { ConfigurationService } from '../Configuration/service/ConfigurationService'
import { SkillMatrixRepository } from '@src/infrastructure/SkillMatrix/repository/SkillMatrixRepository'
import { SkillMatrixService } from '../SkillMatrix/service/SkillMatrixService'
import { UserService } from '../User/service/UserService'
import { EffortRepository } from '@src/infrastructure/Effort/repository/EffortRepository'
import { EffortService } from '../Effort/service/EffortService'
import { OpenAIService } from '../OpenAI/service/OpenAIService'
import { OpenAiClient } from '@src/infrastructure/OpenAI/OpenAIClient'
import { SSMClient } from '@src/infrastructure/SSM/SSMClient'
import { DummySSMClient } from '@src/infrastructure/SSM/DummySSMClient'
import { SSMClientInterface } from '../SSM/SSMClientInterface'
import { TaskRepository } from '@src/infrastructure/Task/repository/TaskRepository'
import { TaskService } from '@src/core/Task/service/TaskService'
import { AuthService } from '../Auth/service/AuthService'
import { ClaranetProvider } from '../Auth/providers/ClaranetProvider'
import { ProviderResolver } from '../Auth/providers/providerResolver'
import { OAuth2Client } from 'google-auth-library'
import { GoogleProvider } from '../Auth/providers/GoogleProvider'
import { TimeEntryRepository } from '@src/infrastructure/TimeEntry/Repository/TimeEntryRepository'
import { TimeEntryService } from '../TimeEntry/service/TimeEntryService'
import { companyRepository } from '@src/infrastructure/Company/Repository/CompanyRepository'
import { CrewRepository } from '@src/infrastructure/Configuration/Repository/CrewRepository'

declare module 'fastify' {
  interface FastifyInstance {
    dependencyInjectionContainer: () => AwilixContainer
  }
}

async function dependencyInjectionContainerPlugin(
  fastify: FastifyInstance,
): Promise<void> {
  const isTest = process.env.STAGE_NAME === 'test'
  const ssmClient: SSMClientInterface =
    isTest || process.env.IS_OFFLINE ? new DummySSMClient() : new SSMClient()
  const openAIClient = OpenAiClient.getClient(await ssmClient.getOpenAIkey())
  const googleClientId = await ssmClient.getGoogleClientId()
  const googleClientSecret = await ssmClient.getGoogleSecret()
  const dependencyInjectionContainer = (): AwilixContainer => {
    const container = awilix.createContainer({
      injectionMode: awilix.InjectionMode.CLASSIC,
    })

    container.register({
      isTest: awilix.asValue(isTest),
    })

    container.register({
      dynamoDBClient: awilix.asValue(DynamoDBConnection.getClient()),
    })

    container.register({
      configurationService: asClass(ConfigurationService),
    })

    container.register({
      skillMatrixRepository: asClass(SkillMatrixRepository),
    })
    container.register({
      skillMatrixService: asClass(SkillMatrixService),
    })

    container.register({
      userProfileRepository: asClass(UserProfileRepository),
    })
    container.register({
      userProfileService: asClass(UserProfileService),
    })

    container.register({
      userService: asClass(UserService),
    })

    container.register({
      effortRepository: asClass(EffortRepository),
    })
    container.register({
      effortService: asClass(EffortService),
    })

    container.register({
      openAI: awilix.asValue(openAIClient),
    })
    container.register({
      openAIService: asClass(OpenAIService),
    })

    container.register({
      taskRepository: asClass(TaskRepository),
    })
    container.register({
      taskService: asClass(TaskService),
    })    
    container.register({
      timeEntryRepository: asClass(TimeEntryRepository)
    })

    container.register({
      timeEntryService: asClass(TimeEntryService)
    })
    container.register({
      jwt: awilix.asValue(fastify.jwt),
    })
    container.register({
      authService: asClass(AuthService),
    })

    container.register({
      claranetProvider: asClass(ClaranetProvider),
    })

    container.register({
      gooleAuthClient: awilix.asValue(
        new OAuth2Client(
          googleClientId,
          googleClientSecret,
          process.env.GOOGLE_CALLBACK_URL
        ),
      ),
    })

    container.register({
      providerResolver: asClass(ProviderResolver).inject(() => ({
        container: container,
      })),
    })
    container.register({
      googleProvider: asClass(GoogleProvider),
    })
    container.register({
      jwt: awilix.asValue(fastify.jwt),
    })
    container.register({
      authService: asClass(AuthService),
    })

    container.register({
      claranetProvider: asClass(ClaranetProvider),
    })

    container.register({
      gooleAuthClient: awilix.asValue(
        new OAuth2Client(
          googleClientId,
          googleClientSecret,
          'http://localhost:3000/dev/api/auth/google/oauthCallback'
        ),
      ),
    })

    container.register({
      providerResolver: asClass(ProviderResolver).inject(() => ({
        container: container,
      })),
    })
    container.register({
      googleProvider: asClass(GoogleProvider),
    })
    container.register({
      companyRepository: asClass(companyRepository)
    })
    container.register({
      crewRepository: asClass(CrewRepository)
    })

    return container
  }

  fastify.decorate('dependencyInjectionContainer', dependencyInjectionContainer)
}

export default fp(dependencyInjectionContainerPlugin)
