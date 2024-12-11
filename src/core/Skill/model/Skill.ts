import { Static, Type } from '@sinclair/typebox'
import { Company } from '@src/core/Company/model/Company'

export const Skill = Type.Object({
  id: Type.Optional(Type.Integer()),
  name: Type.String(),
  serviceLine: Type.String(),
  visible: Type.Boolean({ default: false }),
})

export type SkillType = Static<typeof Skill>

export const SkillWithCompany = Type.Intersect([
  Skill,
  Type.Object({
    company: Company,
  }),
])

export type SkillWithCompanyType = Static<typeof SkillWithCompany>

export class SkillFactory {
  static createSkill(skill: SkillWithCompanyType): SkillWithCompanyType {
    return {
      name: skill.name,
      serviceLine: skill.serviceLine,
      visible: skill.visible,
      company: skill.company,
    }
  }
}
