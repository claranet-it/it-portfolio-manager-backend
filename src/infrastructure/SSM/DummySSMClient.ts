import { SSMClientInterface } from '@src/core/SSM/SSMClientInterface'

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
}
