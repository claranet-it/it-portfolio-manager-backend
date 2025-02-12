import { SSMClientInterface } from '@src/core/SSM/SSMClientInterface'
import * as process from 'node:process'

export class DummySSMClient implements SSMClientInterface {
  getJwtPrivateKey(): Promise<string> {
    throw new Error('Method not implemented.')
  }
  getJWTPublicKey(): Promise<string> {
    throw new Error('Method not implemented.')
  }
  getGoogleClientId(): Promise<string> {
    return Promise.resolve(process.env.GOOGLE_CLIENT_ID_ARN ?? '')
  }
  getGoogleSecret(): Promise<string> {
    return Promise.resolve(process.env.GOOGLE_CLIENT_SECRET_ARN ?? '')
  }
  async getOpenAIkey(): Promise<string> {
    return Promise.resolve('')
  }
  async getSlackToken(): Promise<string> {
    return Promise.resolve('')
  }
  async getBricklyApiKey(): Promise<string> {
    return Promise.resolve('1234')
  }

  async getMsalClientId(): Promise<string> {
    return Promise.resolve(process.env.MSAL_CLIENT_ID ?? '1234')
  }

  async getMsalClientSecret(): Promise<string> {
    return Promise.resolve(process.env.MSAL_CLIENT_SECRET ?? '1234')
  }

  async getMsalCloudInstance(): Promise<string> {
    return Promise.resolve(process.env.MSAL_CLOUD_INSTANCE ?? '1234')
  }

  async getMsalTenantId(): Promise<string> {
    return Promise.resolve(process.env.MSAL_TENANT_ID ?? '1234')
  }
}
