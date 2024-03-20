import OpenAI from 'openai'

export class OpenAiClient {
  static getClient(key: string) {
    return new OpenAI({ apiKey: key })
  }
}
