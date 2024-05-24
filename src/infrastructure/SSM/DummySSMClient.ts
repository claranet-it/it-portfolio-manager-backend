import { SSMClientInterface } from '@src/core/SSM/SSMClientInterface'

export class DummySSMClient implements SSMClientInterface {
  getGoogleClientId(): Promise<string> {
    return Promise.resolve(process.env.GOOGLE_CLIENT_ID_ARN ?? '')
  }
  getGoogleSecret(): Promise<string> {
    return Promise.resolve(process.env.GOOGLE_CLIENT_SECRET_ARN ?? '')
  }
  async getOpenAIkey(): Promise<string> {
    return Promise.resolve('dummyOpenAIApiKey')
  }
  async getSlackToken(): Promise<string> {
    return Promise.resolve('dummySlackToken')
  }
}
