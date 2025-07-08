import { SkillRepositoryInterface } from '@src/core/Skill/repository/SkillRepositoryInterface'
import { SkillType, SkillWithCompanyType } from '@src/core/Skill/model/Skill'
import { PrismaDBConnection } from '@src/infrastructure/db/PrismaDBConnection'

export class SkillRepository implements SkillRepositoryInterface {
  constructor(private readonly prismaDBConnection: PrismaDBConnection) {}

  async findById(
    id: number,
    joinCompany: boolean = false,
  ): Promise<SkillWithCompanyType | null> {
    const skill = await this.prismaDBConnection.getClient().skill.findFirst({
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
    const upsertedSkills = await this.prismaDBConnection.getClient().$transaction(
      skills.map((skill) => {
        if (!skill.id) {
          return this.prismaDBConnection.getClient().skill.create({
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
          return this.prismaDBConnection.getClient().skill.update({
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
