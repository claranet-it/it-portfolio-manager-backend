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
import { CrewRepository } from '@src/infrastructure/Configuration/Repository/CrewRepository'
import { CompanyRepository } from '@src/infrastructure/Company/Repository/CompanyRepository'
import { NetworkingService } from '@src/core/Networking/service/NetworkingService'
import { NetworkingRepository } from '@src/infrastructure/Networking/repository/NetworkingRepository'
import { ReportRepository } from '@src/infrastructure/Report/repository/ReportRepository'
import { ReportService } from '@src/core/Report/service/ReportService'
import { ProductivityCalculator } from '@src/core/Report/service/ProductivityCalculator'
import { TaskPropertiesRepository } from '@src/infrastructure/Task/repository/TaskPropertiesRepository'
import { CompanyService } from '../Company/service/CompanyService'
import { SkillRepository } from '@src/infrastructure/Skill/Repository/SkillRepository'
import { SkillService } from '@src/core/Skill/service/SkillService'
import { CompanyConnectionsRepository } from '@src/infrastructure/CompanyConnections/Repository/CompanyConnectionsRepository'
import { CompanyConnectionsService } from '@src/core/CompanyConnections/service/CompanyConnectionsService'
import { BusinessCardService } from '../BusinessCard/service'
import { BusinessCardRepository } from '@src/infrastructure/BusinessCard/Repository'
import { BackgroundTemplateService } from '../BackgroundTemplate//service'
import * as msal from '@azure/msal-node'
import { MsalService } from '@src/core/Auth/service/MsalService'
import { MicrosoftProvider } from '@src/core/Auth/providers/MicrosoftProvider'
import { CurriculumService } from '../Curriculum/service'
import { CurriculumRepository } from '@src/infrastructure/Curriculum/Repository'
import { EducationRepository } from '@src/infrastructure/Education/Repository'
import { EducationService } from '../Education/service'
import { WorkService } from '../Work/service'
import { WorkRepository } from '@src/infrastructure/Work/Repository'
import { TemplateService } from '../Template/service'
import { TemplateRepository } from '@src/infrastructure/Template/Repository'

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
  const msalClientId = await ssmClient.getMsalClientId()
  const msalCloudInstance = await ssmClient.getMsalCloudInstance()
  const msalClientSecret = await ssmClient.getMsalClientSecret()

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
      networkingService: asClass(NetworkingService),
    })

    container.register({
      networkingRepository: asClass(NetworkingRepository),
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
      reportRepository: asClass(ReportRepository),
    })
    container.register({
      reportService: asClass(ReportService),
    })

    container.register({
      productivityCalculator: asClass(ProductivityCalculator),
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
      taskPropertiesRepository: asClass(TaskPropertiesRepository),
    })
    container.register({
      taskService: asClass(TaskService),
    })
    container.register({
      timeEntryRepository: asClass(TimeEntryRepository),
    })

    container.register({
      timeEntryService: asClass(TimeEntryService),
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
          process.env.GOOGLE_CALLBACK_URL,
        ),
      ),
    })

    container.register({
      msalClient: awilix.asValue(
        new msal.ConfidentialClientApplication({
          auth: {
            clientId: msalClientId,
            authority: msalCloudInstance + 'common',
            clientSecret: msalClientSecret,
          },
        }),
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
      providerResolver: asClass(ProviderResolver).inject(() => ({
        container: container,
      })),
    })
    container.register({
      googleProvider: asClass(GoogleProvider),
    })
    container.register({
      microsoftProvider: asClass(MicrosoftProvider),
    })
    container.register({
      companyRepository: asClass(CompanyRepository),
    })
    container.register({
      crewRepository: asClass(CrewRepository),
    })
    container.register({
      companyService: asClass(CompanyService),
    })
    container.register({
      skillRepository: asClass(SkillRepository),
    })
    container.register({
      skillService: asClass(SkillService),
    })
    container.register({
      companyConnectionsRepository: asClass(CompanyConnectionsRepository),
    })
    container.register({
      companyConnectionsService: asClass(CompanyConnectionsService),
    })

    container.register({
      businessCardService: asClass(BusinessCardService),
    })

    container.register({
      businessCardRepository: asClass(BusinessCardRepository),
    })

    container.register({
      msalService: asClass(MsalService),
    })

    container.register({
      backgroundTemplateService: asClass(BackgroundTemplateService),
    })

    container.register({
      curriculumService: asClass(CurriculumService),
    })

    container.register({
      curriculumRepository: asClass(CurriculumRepository),
    })

    container.register({
      educationService: asClass(EducationService),
    })

    container.register({
      educationRepository: asClass(EducationRepository),
    })

    container.register({
      workService: asClass(WorkService),
    })

    container.register({
      workRepository: asClass(WorkRepository),
    })

    container.register({
      templateService: asClass(TemplateService),
    })

    container.register({
      templateRepository: asClass(TemplateRepository),
    })

    return container
  }

  fastify.decorate('dependencyInjectionContainer', dependencyInjectionContainer)
}

export default fp(dependencyInjectionContainerPlugin)
