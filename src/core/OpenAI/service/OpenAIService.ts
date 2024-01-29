import OpenAI from "openai";
import { openAiResponseType } from "../model/openAI";

export class OpenAIService{
    async getResponse(prompt: string): Promise<openAiResponseType>{
        const openai = new OpenAI();
        const completion = await openai.completions.create({
            model: 'gpt-3.5-turbo',
            prompt: prompt,
            temperature: 0
        })
        return{
            message: completion.choices[0].text
        }
    }
}