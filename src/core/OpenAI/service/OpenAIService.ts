import OpenAI from 'openai'
import { openAiResponseType } from '../model/openAI'
import { SkillMatrixService } from '@src/core/SkillMatrix/service/SkillMatrixService'
import { EffortService } from '@src/core/Effort/service/EffortService'

export class OpenAIService {
  constructor(
    private openAI: OpenAI,
    private skillMatrixService: SkillMatrixService,
    private effortService: EffortService,
  ) {}

  async answerQuestionWithSkillsAndEffort(question: string, company: string): Promise<openAiResponseType> {
    const skills = await this.skillMatrixService.getAllSkillMatrix({company});
    const effort = await this.effortService.getEffortNextFormattedResponse({company, months: 3})
    const prompt = `
        Dati i dati di SKILL:
        '''
        ${JSON.stringify(skills)}
        '''    
        e EFFORT 
        '''
        ${JSON.stringify(effort)}
        ''''
        se l'effort non è presente va considerato 0
        prova a rispondere a questa domanda: ${question}`
        console.log(prompt)
    return await this.getResponse(prompt)
  }

  private async getResponse(prompt: string): Promise<openAiResponseType> {
    const completion = await this.openAI.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    })
    return {
      message: completion.choices[0].message.content ?? '',
    }
  }
}
