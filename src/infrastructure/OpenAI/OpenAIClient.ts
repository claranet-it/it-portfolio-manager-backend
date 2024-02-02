import { SSM } from '@aws-sdk/client-ssm'
import OpenAI from 'openai'

export class OpenAiClient {

  static async getClient() {
    const ssm = new SSM();
    const key = await ssm.getParameter({
      Name: process.env.OPENAI_API_KEY_ARN,
      WithDecryption: true,
    })
    if(!key.Parameter){
        throw new Error('OpenAI key not found')
    }
    return new OpenAI({apiKey: key.Parameter.Value})
  }
}
