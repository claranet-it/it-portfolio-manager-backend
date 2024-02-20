import { WebClient } from '@slack/web-api'
import { EffortService } from '@src/core/Effort/service/EffortService'
import { SkillMatrixService } from '@src/core/SkillMatrix/service/SkillMatrixService'
import { ResignedPeopleService } from '@src/core/User/service/ResignedPeopleService'
import { UserProfileService } from '@src/core/User/service/UserProfileService'
import { EffortRepository } from '@src/infrastructure/Effort/repository/EffortRepository'
import { SkillMatrixRepository } from '@src/infrastructure/SkillMatrix/repository/SkillMatrixRepository'
import { SlackClient } from '@src/infrastructure/Slack/SlackClient'
import { UserProfileRepository } from '@src/infrastructure/User/repository/UserProfileRepository'
import { DynamoDBConnection } from '@src/infrastructure/db/DynamoDBConnection'

const dynamo = DynamoDBConnection.getClient()
const userService = new UserProfileService(new UserProfileRepository(dynamo))
const resignedPeopleService = new ResignedPeopleService(
  userService,
  new EffortService(new EffortRepository(dynamo, false), userService),
  new SkillMatrixService(new SkillMatrixRepository(dynamo), userService),
)

export async function handler() {
  const slackClient = await SlackClient.getclient()!
  const users = await userService.getAllUserProfiles()
  users.forEach(async (user) => {
    const slackUser = await getSlackUser(slackClient, user.uid, user.company)
    if (slackUser?.deleted) {
      console.log(`removing ${user.uid} data`)
      await resignedPeopleService.removeResigned(user.uid)
    }
  })
  return { message: 'done' }
}

async function getSlackUser(
  slackClient: WebClient,
  email: string,
  company: string,
) {
  let slackUser = await slackClient.users.lookupByEmail({ email: email })
  if (!slackUser.user) {
    slackUser = await slackClient.users.lookupByEmail({
      email: email.replace('claranet.com', `${company}.clara.net`),
    })
    if (!slackUser.user) {
      console.log(`${email} not found in slack`)
      return null
    }
  }
  return slackUser.user
}
