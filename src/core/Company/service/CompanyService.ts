import { JwtTokenType } from '@src/core/JwtToken/model/jwtToken.model'
import { CompanyRepositoryInterface } from '../repository/CompanyRepositoryInterface'
import { CompanyType } from '@src/core/Company/model/Company'

export class CompanyService {
  constructor(private companyRepository: CompanyRepositoryInterface) {}

  async getMine(jwtToken: JwtTokenType): Promise<CompanyType | null> {
    return await this.companyRepository.findOne({ name: jwtToken.company })
  }
}
