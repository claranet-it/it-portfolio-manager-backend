import { JwtTokenType } from '@src/core/JwtToken/model/jwtToken.model'
import { CompanyConnectionsRepositoryInterface } from '../repository/CompanyConnectionsRepositoryInterface'
import { NotFoundException } from '@src/shared/exceptions/NotFoundException'
import { CompanyRepositoryInterface } from '@src/core/Company/repository/CompanyRepositoryInterface'
import { CompanyType } from '@src/core/Company/model/Company'

export class CompanyConnectionsService {
  constructor(
    private companyRepository: CompanyRepositoryInterface,
    private companyConnectionsRepository: CompanyConnectionsRepositoryInterface,
  ) {}

  async getMine(jwtToken: JwtTokenType): Promise<CompanyType[]> {
    const company = await this.companyRepository.findOne({
      name: jwtToken.company,
    })

    if (!company) {
      throw new NotFoundException('Company not found')
    }

    const connections = await this.companyConnectionsRepository.findAll(
      company.id,
    )

    return connections.map((connection) => connection.correspondent)
  }
}
