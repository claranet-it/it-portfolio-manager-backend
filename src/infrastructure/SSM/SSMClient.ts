import { SSM } from '@aws-sdk/client-ssm'
import { SSMClientInterface } from '@src/core/SSM/SSMClientInterface'
import * as process from 'node:process'

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

  async getBricklyApiKey(): Promise<string> {
    const key = await this.ssm.getParameter({
      Name: process.env.BRICKLY_API_KEY_ARN,
      WithDecryption: true,
    })
    if (!key.Parameter || !key.Parameter.Value) {
      throw new Error('Api key not found')
    }
    return key.Parameter.Value
  }

  async getMsalClientId(): Promise<string> {
    const key = await this.ssm.getParameter({
      Name: process.env.MSAL_CLIENT_ID,
      WithDecryption: true,
    })
    if (!key.Parameter || !key.Parameter.Value) {
      throw new Error('Msal client id not found')
    }
    return key.Parameter.Value
  }

  async getMsalClientSecret(): Promise<string> {
    const key = await this.ssm.getParameter({
      Name: process.env.MSAL_CLIENT_SECRET,
      WithDecryption: true,
    })
    if (!key.Parameter || !key.Parameter.Value) {
      throw new Error('Msal client secret not found')
    }
    return key.Parameter.Value
  }

  async getMsalCloudInstance(): Promise<string> {
    const key = await this.ssm.getParameter({
      Name: process.env.MSAL_CLOUD_INSTANCE,
      WithDecryption: true,
    })
    if (!key.Parameter || !key.Parameter.Value) {
      throw new Error('Msal cloud instance not found')
    }
    return key.Parameter.Value
  }

  async getMsalTenantId(): Promise<string> {
    const key = await this.ssm.getParameter({
      Name: process.env.MSAL_TENANT_ID,
      WithDecryption: true,
    })
    if (!key.Parameter || !key.Parameter.Value) {
      throw new Error('Msal tenant id not found')
    }
    return key.Parameter.Value
  }
}
