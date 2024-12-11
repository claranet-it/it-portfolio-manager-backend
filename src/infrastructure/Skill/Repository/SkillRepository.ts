import { PrismaClient } from '../../../../prisma/generated'
import { SkillRepositoryInterface } from '@src/core/Skill/repository/SkillRepositoryInterface'
import { SkillType, SkillWithCompanyType } from '@src/core/Skill/model/Skill'

export class SkillRepository implements SkillRepositoryInterface {
  private prismaClient: PrismaClient

  constructor() {
    this.prismaClient = new PrismaClient()
  }

  async save(skills: SkillWithCompanyType[]): Promise<SkillType[]> {
    const upsertedSkills = await this.prismaClient.$transaction(
      skills.map((skill) =>
        this.prismaClient.skill.upsert({
          where: { id: skill.id || 0 },
          update: {
            name: skill.name,
            visible: skill.visible,
            service_line: skill.serviceLine,
            company: {
              connect: { id: skill.company.id },
            },
          },
          create: {
            name: skill.name,
            visible: skill.visible,
            service_line: skill.serviceLine,
            company: {
              connect: { id: skill.company.id },
            },
          },
        }),
      ),
    )

    return upsertedSkills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      serviceLine: skill.service_line,
      visible: skill.visible,
    }))
  }
}
