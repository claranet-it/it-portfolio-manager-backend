import OpenAI from "openai";
import { openAiResponseType } from "../model/openAI";

export class OpenAIService{
    constructor(private openAI: OpenAI){}

    async getResponse(prompt: string): Promise<openAiResponseType>{
        const completion = await this.openAI.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{role: 'user', content: prompt}],
            temperature: 0
        })
        return{
            message: completion.choices[0].message.content ?? ''
        }
    }
}