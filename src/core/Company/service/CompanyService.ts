import { JwtTokenType } from '@src/core/JwtToken/model/jwtToken.model'
import { CompanyRepositoryInterface } from '../repository/CompanyRepositoryInterface'
import { CompanyType } from '@src/core/Company/model/Company'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { CompanyPatchBodyType } from '@src/core/Company/service/dto/CompanyPatchBody'
import { ForbiddenException } from '@src/shared/exceptions/ForbiddenException'

export class CompanyService {
  constructor(private companyRepository: CompanyRepositoryInterface) {}

  async getMine(jwtToken: JwtTokenType): Promise<CompanyType | null> {
    return await this.companyRepository.findOne({ name: jwtToken.company })
  }

  async patch(jwtToken: JwtTokenType, id: string, body: CompanyPatchBodyType): Promise<void> {
    const company = await this.companyRepository.findById(id)

    if (!company) {
      throw new NotFoundException('Company not found')
    }

    if(company.name !== jwtToken.company) {
      throw new ForbiddenException('Forbidden')
    }

    if(body && body.image_url) {
      company.image_url = body.image_url
    }

    await this.companyRepository.save(company)
  }
}
