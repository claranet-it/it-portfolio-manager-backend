export interface SSMClientInterface {
  getOpenAIkey(): Promise<string>
  getBricklyApiKey(): Promise<string>
  getSlackToken(): Promise<string>
  getGoogleClientId(): Promise<string>
  getGoogleSecret(): Promise<string>
  getJwtPrivateKey(): Promise<string>
  getJWTPublicKey(): Promise<string>
}
