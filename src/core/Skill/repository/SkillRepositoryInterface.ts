import { SkillType, SkillWithCompanyType } from '@src/core/Skill/model/Skill'

export interface SkillRepositoryInterface {
  findById(
    id: number,
    joinSkill?: boolean,
  ): Promise<SkillType | SkillWithCompanyType | null>
  save(
    skills: Partial<SkillWithCompanyType>[] | SkillWithCompanyType[],
  ): Promise<SkillType[]>
}
