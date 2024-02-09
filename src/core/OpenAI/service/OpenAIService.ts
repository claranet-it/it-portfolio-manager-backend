import OpenAI from 'openai'
import { openAiResponseType } from '../model/openAI'
import { SkillMatrixService } from '@src/core/SkillMatrix/service/SkillMatrixService'
import { EffortService } from '@src/core/Effort/service/EffortService'
import { skillsList } from '@src/core/Configuration/service/ConfigurationService';
import { SkillMatrixList } from '@src/core/SkillMatrix/model/skillMatrixList.model';

export class OpenAIService {
  constructor(
    private openAI: OpenAI,
    private skillMatrixService: SkillMatrixService,
    private effortService: EffortService
  ) {}

  private async getRequestedSkills(allSkills: string[], question: string): Promise<{skills: string[]}>{
    const prompt = `il tuo compito è quello di estrarre le skills richieste nella frase selezionandole da SKILLS, rispondi soltanto con output_format 
    
    frase: ${question}
    
    SKILLS:${JSON.stringify(skillsList)}
    
    output_format: {"skills":[...]}` 
     return JSON.parse(await this.getResponse(prompt));
  }

  private async getEffortPeriod(question: string): Promise<{start: string, end: string}>{
    const prompt = `il tuo compito è trovare il periodo descritto nella seguente frase, rispondi soltanto nel formato output_format: 

    frase: ${question} 
    
    se l'anno non è specificato considera ${new Date().getFullYear().toString().slice(-2)} 
    
    output_format: {"start": mm_yy "end": mm_yy}`
    return JSON.parse(await this.getResponse(prompt));
  }

  async answerQuestionWithSkillsAndEffort(question: string, company: string): Promise<openAiResponseType> {
    const skills = await this.skillMatrixService.getAllSkillMatrix({company});
    const filterdSills = await this.getRequestedSkills(skillsList, question)
    const peopleWithSkills = this.filterPeopleWithSkills(skills, filterdSills.skills)
    const effortPeriod = await this.getEffortPeriod(question)
    const effort = (await this.effortService.getEffortPeriod(company, effortPeriod.start, effortPeriod.end))
      .map((e) => {
        return {
          uid: e.uid,
          mont_year: e.month_year,
          confrimedEffort: `${e.confirmedEffort}%`,
          tentativeEffort: `${e.tentativeEffort}%`,
           avaiableEffort: `${100 - e.confirmedEffort - e.tentativeEffort}%`
          }
        })
    
     const prompt = process.env.FIND_TEAM_OPENAI_PROMPT!
       .replace('[[SKILL]]', JSON.stringify(peopleWithSkills))
       .replace('[[EFFORT]]', JSON.stringify(effort))
       .replace('[[QUESTION]]', JSON.stringify(question))
       console.log(prompt)
     return  { message: await this.getResponse(prompt)}
  }

  private async getResponse(prompt: string): Promise<string> {
    const completion = await this.openAI.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    })
    return completion.choices[0].message.content ?? ''
  }

  private filterPeopleWithSkills(peopleWithSkills: SkillMatrixList, skills: string[]){
    return peopleWithSkills
      .getSkillMatrixList()
      .filter(
        (element) =>
          skills
            .map((s) => s.toLowerCase())
            .includes(element.skill.toLowerCase()) && element.score >= 2,
      )
  }
}
