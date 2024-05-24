import { SSMClientInterface } from '@src/core/SSM/SSMClientInterface'

export class DummySSMClient implements SSMClientInterface {
  getGoogleClientId(): Promise<string> {
    return Promise.resolve(process.env.GOOGLE_CLIENT_ID ?? '')
  }
  getGoogleSecret(): Promise<string> {
    return Promise.resolve(process.env.GOOGLE_CLIENT_SECRET ?? '')
  }
  async getOpenAIkey(): Promise<string> {
    return Promise.resolve('dummyOpenAIApiKey')
  }
  async getSlackToken(): Promise<string> {
    return Promise.resolve('dummySlackToken')
  }
}
