import { JwtTokenType } from '@src/core/JwtToken/model/jwtToken.model'
import { CompanyRepositoryInterface } from '../repository/CompanyRepositoryInterface'
import {
  CompanyType,
  CompanyWithSkillsType,
} from '@src/core/Company/model/Company'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { CompanyPatchBodyType } from '@src/core/Company/service/dto/CompanyPatchBody'
import { ForbiddenException } from '@src/shared/exceptions/ForbiddenException'
import { skills } from '@src/core/Configuration/service/ConfigurationService'
import { SkillWithCompanyType } from '@src/core/Skill/model/Skill'
import { SkillRepository } from '@src/infrastructure/Skill/Repository/SkillRepository'
import { SkillType } from '@src/core/Configuration/model/configuration.model'

export class CompanyService {
  constructor(
    private companyRepository: CompanyRepositoryInterface,
    private skillRepository: SkillRepository,
  ) {}

  async networkingFindAll(jwtToken: JwtTokenType): Promise<CompanyType[]> {
    const company = await this.companyRepository.findOne({
      name: jwtToken.company,
    })

    if (!company) {
      throw new NotFoundException('Company not found')
    }

    return this.companyRepository.findAll(company.id, true)
  }

  async getAll(): Promise<CompanyType[]> {
    return await this.companyRepository.findAll()
  }

  async getMine(jwtToken: JwtTokenType): Promise<CompanyWithSkillsType | null> {
    const company = await this.companyRepository.findOne(
      {
        name: jwtToken.company,
      },
      true,
    )

    if (!company) {
      throw new NotFoundException('Company not found')
    }

    return this.checkCompanySkills(company)
  }

  async patch(
    jwtToken: JwtTokenType,
    id: string,
    body: CompanyPatchBodyType,
  ): Promise<void> {
    const company = await this.companyRepository.findById(id)

    if (!company) {
      throw new NotFoundException('Company not found')
    }

    if (company.name !== jwtToken.company) {
      throw new ForbiddenException('Forbidden')
    }

    if (body && body.image_url) {
      company.image_url = body.image_url
    }

    await this.companyRepository.save(company)
  }

  private async checkCompanySkills(
    company: CompanyWithSkillsType,
  ): Promise<CompanyWithSkillsType> {
    if (company.skills?.length === 0) {
      const skillsToCreate: SkillWithCompanyType[] = []
      Object.keys(skills).forEach((serviceLine: string) => {
        skills[serviceLine].forEach((skill: SkillType) => {
          skillsToCreate.push({
            name: skill.name,
            serviceLine: serviceLine,
            visible: true,
            company: company,
          })
        })
      })

      await this.skillRepository.save(skillsToCreate)

      const updatedCompany = await this.companyRepository.findById(
        company.id,
        true,
      )
      if (!updatedCompany) {
        throw new NotFoundException('Company not found after update')
      }
      return updatedCompany
    }
    return company
  }
}
