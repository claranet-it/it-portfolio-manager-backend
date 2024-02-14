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
    const prompt = process.env.FIND_SKILLS_OPENAI_PROMPT!
      .replace('[[QUESTION]]', question)
      .replace('[[SKILL_LIST]]', JSON.stringify(skillsList))
     return JSON.parse(await this.getResponse(prompt));
  }

  private async getEffortPeriod(question: string): Promise<{start: string, month_number: number}>{
    const prompt = process.env.FIND_PERIOD_OPENAI_PROMPT!
      .replace('[[QUESTION]]', question)
      .replace('[[CURRENT_YEAR]]', new Date().getFullYear().toString().slice(-2))
    return JSON.parse(await this.getResponse(prompt));
  }

  async answerQuestionWithSkillsAndEffort(question: string, company: string): Promise<openAiResponseType> {
    const skills = await this.skillMatrixService.getAllSkillMatrix({company});
    const filterdSills = await this.getRequestedSkills(skillsList, question)
    const peopleWithSkills = this.filterPeopleWithSkills(skills, filterdSills.skills)
    const effortPeriod = await this.getEffortPeriod(question)
    const effort = (await this.effortService.getEffortPeriod(peopleWithSkills.map(p => p.uid), effortPeriod.start, effortPeriod.month_number))
    .map((e) => {
      return {
        uid: e.uid,
        mont_year: e.month_year,
        avaiableEffort: `${100 - e.confirmedEffort - e.tentativeEffort}%`,
        possibleAvaiableEffort: `${100 -e.confirmedEffort}%`
        }
      })
    
     const prompt = process.env.FIND_TEAM_OPENAI_PROMPT!
       .replace('[[SKILL]]', JSON.stringify(peopleWithSkills))
       .replace('[[EFFORT]]', JSON.stringify(effort))
       .replace('[[QUESTION]]', JSON.stringify(question))
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
