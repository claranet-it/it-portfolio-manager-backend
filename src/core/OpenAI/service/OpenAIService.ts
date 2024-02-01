import OpenAI from "openai";
import { openAiResponseType } from "../model/openAI";
import { SSM } from "@aws-sdk/client-ssm";

export class OpenAIService{
    async getResponse(prompt: string): Promise<openAiResponseType>{
        const ssmClient = new SSM();
        const key = await ssmClient.getParameter({Name: process.env.OPENAI_API_KEY_ARN, WithDecryption: true});
        const openai = new OpenAI({apiKey: key.Parameter?.Value});
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{role: 'user', content: prompt}],
            temperature: 0
        })
        return{
            message: completion.choices[0].message.content ?? ''
        }
    }
}