import { EffortService } from '@src/core/Effort/service/EffortService'
import { SkillMatrixService } from '@src/core/SkillMatrix/service/SkillMatrixService'
import { removeResignedPeople } from '@src/core/User/runner/removeResignedPeopleRunner'
import { ResignedPeopleService } from '@src/core/User/service/ResignedPeopleService'
import { UserProfileService } from '@src/core/User/service/UserProfileService'
import { EffortRepository } from '@src/infrastructure/Effort/repository/EffortRepository'
import { SSMClient } from '@src/infrastructure/SSM/SSMClient'
import { SkillMatrixRepository } from '@src/infrastructure/SkillMatrix/repository/SkillMatrixRepository'
import { SlackClient } from '@src/infrastructure/Slack/SlackClient'
import { UserProfileRepository } from '@src/infrastructure/User/repository/UserProfileRepository'
import { DynamoDBConnection } from '@src/infrastructure/db/DynamoDBConnection'

const dynamo = DynamoDBConnection.getClient()
const ssmClient = new SSMClient()
const userService = new UserProfileService(new UserProfileRepository(dynamo))
const resignedPeopleService = new ResignedPeopleService(
  userService,
  new EffortService(new EffortRepository(dynamo, false), userService),
  new SkillMatrixService(new SkillMatrixRepository(dynamo), userService),
)

export async function handler() {
  return
  const slackClient = new SlackClient(await ssmClient.getSlackToken())
  await removeResignedPeople(
    userService.getAllUserProfiles.bind(userService),
    slackClient.getAccountStatuses.bind(slackClient),
    resignedPeopleService.removeResigned.bind(resignedPeopleService),
  )
}
