import { WebClient } from '@slack/web-api'
import { accountstatusType } from '@src/core/Slack/model/slack.model'

export class SlackClient {
  client: WebClient

  constructor(token: string) {
    this.client = new WebClient(token)
  }

  async getAccountStatuses(): Promise<accountstatusType[]> {
    const result: accountstatusType[] = []
    let nextcursor = ''
    do {
      const slackUsers = await this.client.users.list({
        limit: 200,
        cursor: nextcursor,
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
      nextcursor = slackUsers.response_metadata?.next_cursor || ''
    } while (nextcursor !== '')
    return result
  }
}
