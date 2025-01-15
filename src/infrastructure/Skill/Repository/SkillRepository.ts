import { PrismaClient } from '../../../../prisma/generated'
import { SkillRepositoryInterface } from '@src/core/Skill/repository/SkillRepositoryInterface'
import { SkillType, SkillWithCompanyType } from '@src/core/Skill/model/Skill'

export class SkillRepository implements SkillRepositoryInterface {
  private prismaClient: PrismaClient

  constructor() {
    this.prismaClient = new PrismaClient()
  }

  async findById(
    id: number,
    joinCompany: boolean = false,
  ): Promise<SkillWithCompanyType | null> {
    const skill = await this.prismaClient.skill.findFirst({
      where: { id: id },
      include: {
        ...(joinCompany && { company: true }),
      },
    })

    if (!skill) {
      return null
    }

    return {
      id: skill.id,
      name: skill.name,
      serviceLine: skill.service_line,
      visible: skill.visible,
      company: skill.company,
    }
  }

  async save(
    skills: Partial<SkillWithCompanyType>[] | SkillWithCompanyType[],
  ): Promise<SkillType[]> {
    const upsertedSkills = await this.prismaClient.$transaction(
      skills.map((skill) => {
        if (!skill.id) {
          return this.prismaClient.skill.create({
            data: {
              name: skill.name!,
              visible: skill.visible,
              service_line: skill.serviceLine!,
              company: {
                connect: {
                  id: skill.company!.id,
                },
              },
            },
          })
        } else {
          return this.prismaClient.skill.update({
            where: { id: skill.id },
            data: {
              visible: skill.visible,
            },
          })
        }
      }),
    )
    return upsertedSkills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      serviceLine: skill.service_line,
      visible: skill.visible,
    }))
  }
}
