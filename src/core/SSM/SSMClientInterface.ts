export interface SSMClientInterface {
  getOpenAIkey(): Promise<string>
  getSlackToken(): Promise<string>
  getGoogleClientId(): Promise<string>
  getGoogleSecret(): Promise<string>
}
