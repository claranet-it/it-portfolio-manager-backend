import { SkillType } from '@src/core/Skill/model/Skill'

export interface SkillRepositoryInterface {
  save(skills: SkillType[]): Promise<SkillType[]>
}
