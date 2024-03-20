import { SSM } from '@aws-sdk/client-ssm'
import { SSMClientInterface } from '@src/core/SSM/SSMClientInterface'

export class SSMClient implements SSMClientInterface {
  ssm: SSM
  constructor() {
    this.ssm = new SSM()
  }

  async getOpenAIkey(): Promise<string> {
    const key = await this.ssm.getParameter({
      Name: process.env.OPENAI_API_KEY_ARN,
      WithDecryption: true,
    })
    if (!key.Parameter || !key.Parameter.Value) {
      throw new Error('OpenAI key not found')
    }
    return key.Parameter.Value
  }

  async getSlackToken(): Promise<string> {
    const key = await this.ssm.getParameter({
      Name: process.env.SLACK_TOKEN_ARN,
      WithDecryption: true,
    })
    if (!key.Parameter || !key.Parameter.Value) {
      throw new Error('Slack token not found')
    }
    return key.Parameter.Value
  }
}
