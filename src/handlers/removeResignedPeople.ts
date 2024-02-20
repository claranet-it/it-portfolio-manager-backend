import { SSM } from '@aws-sdk/client-ssm'
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
  const slackClient = new SlackClient(await getSlackToken())
  const slackUsersStatus = await slackClient.getAccountStatuses()
  const users = await userService.getAllUserProfiles()
  users.forEach(async (user) => {
    const userEmails = [
      user.uid.toLowerCase(),
      user.uid
        .replace('claranet.com', `${user.company}.clara.net`)
        .toLowerCase(),
    ]
    const slackUser = slackUsersStatus.find((u) =>
      userEmails.includes(u.email.toLowerCase()),
    )
    if (slackUser) {
      if (!slackUser.active) {
        console.log(`removing ${user.uid}`)
        //await resignedPeopleService.removeResigned(user.uid)
      }
    } else {
      console.warn(`User ${user.uid} not found in slack`)
    }
  })
  return { message: 'done' }
}

async function getSlackToken(): Promise<string> {
    const ssm = new SSM()
    const key = await ssm.getParameter({
        Name: process.env.SLACK_TOKEN_ARN,
        WithDecryption: true,
      })
      if(!key.Parameter){
          throw new Error('Slack token not found')
      }
      return key.Parameter.Value!
}
