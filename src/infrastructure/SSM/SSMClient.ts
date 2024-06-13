import { SSM } from '@aws-sdk/client-ssm'
import { SSMClientInterface } from '@src/core/SSM/SSMClientInterface'

export class SSMClient implements SSMClientInterface {
  ssm: SSM
  constructor() {
    this.ssm = new SSM()
  }
  async getJwtPrivateKey(): Promise<string> {
    const key = await this.ssm.getParameter({
      Name: process.env.JWT_PRIVATE_KEY_ARN,
      WithDecryption: true,
    })
    if (!key.Parameter || !key.Parameter.Value) {
      throw new Error('jwt private key not found')
    }
    return key.Parameter.Value
  }
  async getJWTPublicKey(): Promise<string> {
    const key = await this.ssm.getParameter({
      Name: process.env.JWT_PUBLIC_KEY_ARN,
      WithDecryption: true,
    })
    if (!key.Parameter || !key.Parameter.Value) {
      throw new Error('jwt public key not found')
    }
    return key.Parameter.Value
  }
  async getGoogleClientId(): Promise<string> {
    const key = await this.ssm.getParameter({
      Name: process.env.GOOGLE_CLIENT_ID_ARN,
      WithDecryption: true,
    })
    if (!key.Parameter || !key.Parameter.Value) {
      throw new Error('Google client id not found')
    }
    return key.Parameter.Value
  }

  async getGoogleSecret(): Promise<string> {
    const key = await this.ssm.getParameter({
      Name: process.env.GOOGLE_CLIENT_SECRET_ARN,
      WithDecryption: true,
    })
    if (!key.Parameter || !key.Parameter.Value) {
      throw new Error('Google secret id not found')
    }
    return key.Parameter.Value
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
