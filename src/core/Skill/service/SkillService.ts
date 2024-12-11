import { JwtTokenType } from '@src/core/JwtToken/model/jwtToken.model'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { ForbiddenException } from '@src/shared/exceptions/ForbiddenException'
import { SkillRepository } from '@src/infrastructure/Skill/Repository/SkillRepository'
import { SkillPatchBodyType } from '@src/core/Skill/service/dto/SkillPatchBody'

export class SkillService {
  constructor(private skillRepository: SkillRepository) {}

  async patch(
    jwtToken: JwtTokenType,
    id: number,
    body: SkillPatchBodyType,
  ): Promise<void> {
    const skill = await this.skillRepository.findById(id, true)

    if (!skill) {
      throw new NotFoundException('Skill not found')
    }

    if (!skill.company || skill.company.name !== jwtToken.company) {
      throw new ForbiddenException('Forbidden')
    }

    if (body && body.visible !== undefined) {
      skill.visible = body.visible
    }

    const toSave = {
      id: skill.id,
      visible: skill.visible,
    }

    await this.skillRepository.save([toSave])
  }
}
