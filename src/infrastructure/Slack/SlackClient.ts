import { WebClient } from '@slack/web-api'
import { accountstatusType } from '@src/core/Slack/model/slack.model'
import { SlackRepositoryInterface } from '@src/core/Slack/repository/SlackRepositoryInterface'

export class SlackClient implements SlackRepositoryInterface {
  client: WebClient

  constructor(token: string) {
    this.client = new WebClient(token)
  }

  async getAccountStatuses(): Promise<accountstatusType[]> {
    const result: accountstatusType[] = []
    let nextCursor = ''
    do {
      const slackUsers = await this.client.users.list({
        limit: 200,
        cursor: nextCursor,
      })
      if (slackUsers.members) {
        result.push(
          ...slackUsers.members
            .filter((member) => member.profile && member.profile.email)
            .map((member) => {
              return {
                email: member.profile!.email!,
                active: !member.deleted,
              }
            }),
        )
      }
      nextCursor = slackUsers.response_metadata?.next_cursor || ''
    } while (nextCursor !== '')
    return result
  }
}
